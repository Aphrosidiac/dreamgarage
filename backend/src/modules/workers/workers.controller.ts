import { FastifyRequest, FastifyReply } from 'fastify'

export async function listWorkers(request: FastifyRequest, reply: FastifyReply) {
  const { branchId } = request.user

  const workers = await request.server.prisma.worker.findMany({
    where: { branchId, isActive: true },
    include: { _count: { select: { documents: true } } },
    orderBy: { name: 'asc' },
  })

  return reply.send({ success: true, data: workers })
}

export async function createWorker(
  request: FastifyRequest<{ Body: { name: string; phone?: string; role?: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { name, phone, role } = request.body

  if (!name?.trim()) {
    return reply.status(400).send({ success: false, message: 'Name is required' })
  }

  const worker = await request.server.prisma.worker.create({
    data: {
      branchId,
      name: name.trim(),
      phone: phone?.trim() || null,
      role: role?.trim() || 'Foreman',
    },
  })

  return reply.status(201).send({ success: true, data: worker })
}

export async function updateWorker(
  request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; phone?: string; role?: string; isActive?: boolean } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params
  const { name, phone, role, isActive } = request.body

  const existing = await request.server.prisma.worker.findFirst({ where: { id, branchId } })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Worker not found' })
  }

  const worker = await request.server.prisma.worker.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(role !== undefined && { role: role?.trim() || 'Foreman' }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return reply.send({ success: true, data: worker })
}

export async function deleteWorker(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { branchId } = request.user
  const { id } = request.params

  const existing = await request.server.prisma.worker.findFirst({ where: { id, branchId } })
  if (!existing) {
    return reply.status(404).send({ success: false, message: 'Worker not found' })
  }

  const docCount = await request.server.prisma.document.count({ where: { foremanId: id } })
  if (docCount > 0) {
    // Soft-delete instead
    await request.server.prisma.worker.update({ where: { id }, data: { isActive: false } })
    return reply.send({ success: true, message: 'Worker deactivated' })
  }

  await request.server.prisma.worker.delete({ where: { id } })
  return reply.send({ success: true, message: 'Worker deleted' })
}
