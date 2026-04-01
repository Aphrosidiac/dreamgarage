import { FastifyInstance } from 'fastify'
import { listStock, getStock, createStock, updateStock, deleteStock } from './stock.controller.js'

export default async function stockRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', listStock)
  fastify.get('/:id', getStock)
  fastify.post('/', createStock)
  fastify.put('/:id', updateStock)
  fastify.delete('/:id', deleteStock)
}
