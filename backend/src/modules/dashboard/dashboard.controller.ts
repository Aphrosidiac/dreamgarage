import { FastifyRequest, FastifyReply } from 'fastify'

export async function getStats(request: FastifyRequest, reply: FastifyReply) {
  const { branchId } = request.user

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [totalItems, stockAgg, invoicesToday, invoicesMonth, quotationsMonth] = await Promise.all([
    request.server.prisma.stockItem.count({ where: { branchId, isActive: true } }),
    request.server.prisma.stockItem.aggregate({
      where: { branchId, isActive: true },
      _sum: { quantity: true },
    }),
    request.server.prisma.document.findMany({
      where: { branchId, documentType: 'INVOICE', status: { notIn: ['VOID', 'CANCELLED', 'DRAFT'] }, issueDate: { gte: today } },
    }),
    request.server.prisma.document.findMany({
      where: { branchId, documentType: 'INVOICE', status: { notIn: ['VOID', 'CANCELLED', 'DRAFT'] }, issueDate: { gte: monthStart } },
    }),
    request.server.prisma.document.count({
      where: { branchId, documentType: 'QUOTATION', issueDate: { gte: monthStart } },
    }),
  ])

  const revenueToday = invoicesToday.reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0)
  const revenueThisMonth = invoicesMonth.reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0)

  return reply.send({
    success: true,
    data: {
      totalItems,
      totalStockQty: stockAgg._sum.quantity || 0,
      invoicesToday: invoicesToday.length,
      invoicesThisMonth: invoicesMonth.length,
      quotationsThisMonth: quotationsMonth,
      revenueToday,
      revenueThisMonth,
    },
  })
}

export async function getLowStock(request: FastifyRequest, reply: FastifyReply) {
  const { branchId } = request.user

  // Use raw query to compare quantity <= minStock (Prisma can't compare two columns)
  const items = await request.server.prisma.$queryRaw`
    SELECT si.*, sc.name as "categoryName"
    FROM stock_items si
    LEFT JOIN stock_categories sc ON si."categoryId" = sc.id
    WHERE si."branchId" = ${branchId}
    AND si."isActive" = true
    AND si.quantity <= si."minStock"
    ORDER BY si.quantity ASC
    LIMIT 20
  `

  return reply.send({ success: true, data: items })
}

export async function getRecentInvoices(request: FastifyRequest, reply: FastifyReply) {
  const { branchId } = request.user

  const documents = await request.server.prisma.document.findMany({
    where: { branchId, documentType: 'INVOICE' },
    include: { createdBy: { select: { name: true } }, _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return reply.send({ success: true, data: documents })
}
