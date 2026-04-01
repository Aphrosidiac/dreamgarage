import { FastifyInstance } from 'fastify'
import { getStats, getLowStock, getRecentInvoices } from './dashboard.controller.js'

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/stats', getStats)
  fastify.get('/low-stock', getLowStock)
  fastify.get('/recent-invoices', getRecentInvoices)
}
