import { FastifyPluginAsync } from 'fastify'
import { getJobs, getControllerJobs, setWorkshopStatus } from './shop-display.controller.js'

const shopDisplayRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate)
  fastify.get('/jobs', getJobs)
  fastify.get('/controller-jobs', getControllerJobs)
  fastify.patch('/documents/:id/workshop-status', setWorkshopStatus)
}

export default shopDisplayRoutes
