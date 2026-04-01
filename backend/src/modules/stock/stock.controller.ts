import { FastifyRequest, FastifyReply } from 'fastify'
import { getPaginationParams, paginatedResponse } from '../../utils/pagination.js'
import { Prisma } from '@prisma/client'

const ALLOWED_SORT_FIELDS = ['itemCode', 'description', 'costPrice', 'sellPrice', 'quantity', 'updatedAt', 'createdAt']

export async function listStock(
  request: FastifyRequest<{ Querystring: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { page, limit, skip } = getPaginationParams(request.query)
  const { search, categoryId, sortBy, order } = request.query as any

  const where: Prisma.StockItemWhereInput = {
    branchId,
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { itemCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const validSort = sortBy && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'updatedAt'
  const orderBy: Prisma.StockItemOrderByWithRelationInput = {
    [validSort]: order === 'desc' ? 'desc' : (sortBy ? 'asc' : 'desc'),
  }

  const [data, total] = await Promise.all([
    request.server.prisma.stockItem.findMany({
      where,
      include: { category: { select: { id: true, name: true, code: true } } },
      orderBy,
      skip,
      take: limit,
    }),
    request.server.prisma.stockItem.count({ where }),
  ])

  return reply.send(paginatedResponse(data, total, page, limit))
}

export async function getStock(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const item = await request.server.prisma.stockItem.findFirst({
    where: { id: request.params.id, branchId },
    include: { category: true },
  })

  if (!item) {
    return reply.status(404).send({ success: false, message: 'Item not found' })
  }

  return reply.send({ success: true, data: item })
}

export async function createStock(
  request: FastifyRequest<{
    Body: {
      itemCode: string
      description: string
      uom?: string
      costPrice: number
      sellPrice: number
      quantity?: number
      categoryId?: string
    }
  }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { itemCode, description, uom, costPrice, sellPrice, quantity, categoryId } = request.body

  if (!itemCode || !description) {
    return reply.status(400).send({ success: false, message: 'Item code and description are required' })
  }

  if (costPrice < 0 || sellPrice < 0) {
    return reply.status(400).send({ success: false, message: 'Prices must be non-negative' })
  }

  const item = await request.server.prisma.stockItem.create({
    data: {
      branchId,
      itemCode,
      description,
      uom: uom || 'PCS',
      costPrice,
      sellPrice,
      quantity: Math.max(0, quantity || 0),
      categoryId,
    },
    include: { category: true },
  })

  return reply.status(201).send({ success: true, data: item })
}

export async function updateStock(
  request: FastifyRequest<{ Params: { id: string }; Body: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params
  const { itemCode, description, uom, costPrice, sellPrice, quantity, categoryId } = request.body

  // Verify item belongs to this branch
  const existing = await request.server.prisma.stockItem.findFirst({
    where: { id, branchId },
  })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Item not found' })
  }

  if (costPrice !== undefined && costPrice < 0) {
    return reply.status(400).send({ success: false, message: 'Cost price must be non-negative' })
  }
  if (sellPrice !== undefined && sellPrice < 0) {
    return reply.status(400).send({ success: false, message: 'Sell price must be non-negative' })
  }

  const item = await request.server.prisma.stockItem.update({
    where: { id },
    data: {
      ...(itemCode && { itemCode }),
      ...(description && { description }),
      ...(uom && { uom }),
      ...(costPrice !== undefined && { costPrice }),
      ...(sellPrice !== undefined && { sellPrice }),
      ...(quantity !== undefined && { quantity: Math.max(0, quantity) }),
      ...(categoryId !== undefined && { categoryId }),
    },
    include: { category: true },
  })

  return reply.send({ success: true, data: item })
}

export async function deleteStock(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params

  const existing = await request.server.prisma.stockItem.findFirst({
    where: { id, branchId },
  })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Item not found' })
  }

  await request.server.prisma.stockItem.update({
    where: { id },
    data: { isActive: false },
  })

  return reply.send({ success: true, message: 'Item deleted' })
}
