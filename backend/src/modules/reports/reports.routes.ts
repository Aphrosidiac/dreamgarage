import { FastifyInstance } from 'fastify'
import { getDailyPaymentLog, getWorkerStats, getStaffJobHistory } from './reports.controller.js'

export default async function reportRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/payment-log', getDailyPaymentLog)
  fastify.get('/worker-stats', getWorkerStats)
  fastify.get('/staff-history/:userId', getStaffJobHistory)
}
