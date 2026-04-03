import { FastifyInstance } from 'fastify'
import { listWorkers, createWorker, updateWorker, deleteWorker } from './workers.controller.js'

export default async function workerRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', listWorkers)
  fastify.post('/', createWorker)
  fastify.put('/:id', updateWorker)
  fastify.delete('/:id', deleteWorker)
}
