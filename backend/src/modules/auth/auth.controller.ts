import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyPassword } from '../../utils/password.js'

export async function login(request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) {
  const { email, password } = request.body

  if (!email || !password) {
    return reply.status(400).send({ success: false, message: 'Email and password are required' })
  }

  const user = await request.server.prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.isActive) {
    return reply.status(401).send({ success: false, message: 'Invalid credentials' })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return reply.status(401).send({ success: false, message: 'Invalid credentials' })
  }

  const token = request.server.jwt.sign({
    userId: user.id,
    branchId: user.branchId,
    role: user.role,
  })

  return reply.send({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
      },
    },
  })
}

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user

  const user = await request.server.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, branchId: true },
  })

  if (!user) {
    return reply.status(404).send({ success: false, message: 'User not found' })
  }

  return reply.send({ success: true, data: user })
}
