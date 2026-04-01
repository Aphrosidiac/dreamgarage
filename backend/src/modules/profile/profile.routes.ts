import { FastifyInstance } from 'fastify'
import { getProfile, updateProfile, changePassword, updateBranch } from './profile.controller.js'

export default async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', getProfile)
  fastify.put('/', updateProfile)
  fastify.put('/password', changePassword)
  fastify.put('/branch', updateBranch)
}
