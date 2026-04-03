import { FastifyInstance } from 'fastify'
import { getDailyPaymentLog } from './reports.controller.js'

export default async function reportRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/payment-log', getDailyPaymentLog)
}
