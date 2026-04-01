import { FastifyRequest, FastifyReply } from 'fastify'
import { getPaginationParams, paginatedResponse } from '../../utils/pagination.js'
import { Prisma } from '@prisma/client'
import { recordStockHistory } from './stock.history.js'

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
  const { branchId, userId } = request.user
  const { itemCode, description, uom, costPrice, sellPrice, quantity, categoryId } = request.body

  if (!itemCode || !description) {
    return reply.status(400).send({ success: false, message: 'Item code and description are required' })
  }

  if (costPrice < 0 || sellPrice < 0) {
    return reply.status(400).send({ success: false, message: 'Prices must be non-negative' })
  }

  const initialQty = Math.max(0, quantity || 0)

  const item = await request.server.prisma.stockItem.create({
    data: {
      branchId,
      itemCode,
      description,
      uom: uom || 'PCS',
      costPrice,
      sellPrice,
      quantity: initialQty,
      categoryId,
    },
    include: { category: true },
  })

  // Record history
  if (initialQty > 0) {
    await recordStockHistory({
      prisma: request.server.prisma,
      branchId,
      stockItemId: item.id,
      type: 'IN',
      quantity: initialQty,
      previousQty: 0,
      newQty: initialQty,
      reason: 'Initial stock',
      createdById: userId,
    })
  }

  return reply.status(201).send({ success: true, data: item })
}

export async function updateStock(
  request: FastifyRequest<{ Params: { id: string }; Body: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId, userId } = request.user
  const { id } = request.params
  const { itemCode, description, uom, costPrice, sellPrice, quantity, categoryId } = request.body

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

  const newQty = quantity !== undefined ? Math.max(0, quantity) : undefined

  const item = await request.server.prisma.stockItem.update({
    where: { id },
    data: {
      ...(itemCode && { itemCode }),
      ...(description && { description }),
      ...(uom && { uom }),
      ...(costPrice !== undefined && { costPrice }),
      ...(sellPrice !== undefined && { sellPrice }),
      ...(newQty !== undefined && { quantity: newQty }),
      ...(categoryId !== undefined && { categoryId }),
    },
    include: { category: true },
  })

  // Record history if quantity changed
  if (newQty !== undefined && newQty !== existing.quantity) {
    const diff = newQty - existing.quantity
    await recordStockHistory({
      prisma: request.server.prisma,
      branchId,
      stockItemId: id,
      type: diff > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(diff),
      previousQty: existing.quantity,
      newQty,
      reason: 'Manual adjustment',
      createdById: userId,
    })
  }

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

// ─── STOCK ADJUST ──────────────────────────────────────────
export async function adjustStock(
  request: FastifyRequest<{
    Params: { id: string }
    Body: { type: 'add' | 'remove'; quantity: number; reason: string }
  }>,
  reply: FastifyReply
) {
  const { branchId, userId } = request.user
  const { id } = request.params
  const { type, quantity, reason } = request.body

  if (!quantity || quantity <= 0) {
    return reply.status(400).send({ success: false, message: 'Quantity must be positive' })
  }
  if (!reason?.trim()) {
    return reply.status(400).send({ success: false, message: 'Reason is required' })
  }

  const existing = await request.server.prisma.stockItem.findFirst({ where: { id, branchId } })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Item not found' })
  }

  if (type === 'remove' && existing.quantity < quantity) {
    return reply.status(400).send({ success: false, message: `Insufficient stock: have ${existing.quantity}, trying to remove ${quantity}` })
  }

  const newQty = type === 'add' ? existing.quantity + quantity : existing.quantity - quantity

  const item = await request.server.prisma.stockItem.update({
    where: { id },
    data: { quantity: newQty },
    include: { category: true },
  })

  await recordStockHistory({
    prisma: request.server.prisma,
    branchId,
    stockItemId: id,
    type: type === 'add' ? 'IN' : 'OUT',
    quantity,
    previousQty: existing.quantity,
    newQty,
    reason: reason.trim(),
    createdById: userId,
  })

  return reply.send({ success: true, data: item })
}

// ─── STOCK HISTORY ─────────────────────────────────────────
export async function getStockHistory(
  request: FastifyRequest<{ Params: { id: string }; Querystring: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params
  const { page, limit, skip } = getPaginationParams(request.query)
  const { type, from, to } = request.query as any

  const where: Prisma.StockHistoryWhereInput = {
    stockItemId: id,
    branchId,
    ...(type && { type }),
    ...(from || to ? {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to + 'T23:59:59') }),
      },
    } : {}),
  }

  const [data, total] = await Promise.all([
    request.server.prisma.stockHistory.findMany({
      where,
      include: { createdBy: { select: { name: true } }, document: { select: { documentNumber: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    request.server.prisma.stockHistory.count({ where }),
  ])

  return reply.send(paginatedResponse(data, total, page, limit))
}

export async function getAllStockHistory(
  request: FastifyRequest<{ Querystring: Record<string, any> }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { page, limit, skip } = getPaginationParams(request.query)
  const { type, from, to, search } = request.query as any

  const where: Prisma.StockHistoryWhereInput = {
    branchId,
    ...(type && { type }),
    ...(search && {
      stockItem: {
        OR: [
          { itemCode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
    }),
    ...(from || to ? {
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to + 'T23:59:59') }),
      },
    } : {}),
  }

  const [data, total] = await Promise.all([
    request.server.prisma.stockHistory.findMany({
      where,
      include: {
        stockItem: { select: { itemCode: true, description: true } },
        createdBy: { select: { name: true } },
        document: { select: { documentNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    request.server.prisma.stockHistory.count({ where }),
  ])

  return reply.send(paginatedResponse(data, total, page, limit))
}
