import { FastifyRequest, FastifyReply } from 'fastify'

export async function listSupplierCategories(request: FastifyRequest, reply: FastifyReply) {
  const { branchId } = request.user

  const categories = await request.server.prisma.supplierCategory.findMany({
    where: { branchId },
    include: { _count: { select: { suppliers: true } } },
    orderBy: { name: 'asc' },
  })

  return reply.send({ success: true, data: categories })
}

export async function createSupplierCategory(
  request: FastifyRequest<{ Body: { name: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { name } = request.body

  if (!name?.trim()) {
    return reply.status(400).send({ success: false, message: 'Name is required' })
  }

  const existing = await request.server.prisma.supplierCategory.findUnique({
    where: { branchId_name: { branchId, name: name.trim() } },
  })
  if (existing) {
    return reply.status(400).send({ success: false, message: 'Category already exists' })
  }

  const category = await request.server.prisma.supplierCategory.create({
    data: { branchId, name: name.trim() },
  })

  return reply.status(201).send({ success: true, data: category })
}

export async function deleteSupplierCategory(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params

  const existing = await request.server.prisma.supplierCategory.findFirst({
    where: { id, branchId },
    include: { _count: { select: { suppliers: true } } },
  })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Category not found' })
  }
  if (existing._count.suppliers > 0) {
    return reply.status(400).send({ success: false, message: `Cannot delete category with ${existing._count.suppliers} supplier(s)` })
  }

  await request.server.prisma.supplierCategory.delete({ where: { id } })
  return reply.send({ success: true })
}
