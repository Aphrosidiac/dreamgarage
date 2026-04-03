import { FastifyRequest, FastifyReply } from 'fastify'
import { Prisma } from '@prisma/client'
import { getPaginationParams, paginatedResponse } from '../../utils/pagination.js'

export async function getDailyPaymentLog(
  request: FastifyRequest<{ Querystring: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { page, limit, skip } = getPaginationParams(request.query)
  const { from, to, method, search } = request.query as any

  // Default to today if no date range
  const dateFrom = from ? new Date(from) : new Date(new Date().setHours(0, 0, 0, 0))
  const dateTo = to ? new Date(to + 'T23:59:59.999') : new Date(new Date().setHours(23, 59, 59, 999))

  const where: Prisma.PaymentWhereInput = {
    createdAt: { gte: dateFrom, lte: dateTo },
    document: {
      branchId,
      ...(search && {
        OR: [
          { documentNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { vehiclePlate: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    ...(method && { paymentMethod: method }),
  }

  const [payments, total] = await Promise.all([
    request.server.prisma.payment.findMany({
      where,
      include: {
        document: {
          select: {
            documentNumber: true,
            customerName: true,
            vehiclePlate: true,
          },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    request.server.prisma.payment.count({ where }),
  ])

  // Get summary for the full date range (not paginated)
  const allPayments = await request.server.prisma.payment.findMany({
    where,
    select: { amount: true, paymentMethod: true },
  })

  const byMethod: Record<string, { total: number; count: number }> = {}
  let grandTotal = 0

  for (const p of allPayments) {
    const m = p.paymentMethod
    if (!byMethod[m]) byMethod[m] = { total: 0, count: 0 }
    const amount = p.amount.toNumber()
    byMethod[m].total = Math.round((byMethod[m].total + amount) * 100) / 100
    byMethod[m].count++
    grandTotal = Math.round((grandTotal + amount) * 100) / 100
  }

  const data = payments.map((p) => ({
    id: p.id,
    amount: p.amount.toNumber(),
    paymentMethod: p.paymentMethod,
    referenceNumber: p.referenceNumber,
    bankName: p.bankName,
    notes: p.notes,
    documentNumber: p.document.documentNumber,
    customerName: p.document.customerName,
    vehiclePlate: p.document.vehiclePlate,
    createdBy: p.createdBy?.name,
    createdAt: p.createdAt,
  }))

  return reply.send({
    ...paginatedResponse(data, total, page, limit),
    summary: {
      grandTotal,
      totalPayments: allPayments.length,
      byMethod,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
    },
  })
}
