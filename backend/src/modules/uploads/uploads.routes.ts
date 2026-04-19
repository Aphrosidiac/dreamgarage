import { FastifyInstance } from 'fastify'
import { uploadPhoto, deletePhoto } from './uploads.controller.js'

export default async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', { preHandler: [app.authenticate] }, uploadPhoto)
  app.delete('/:filename', { preHandler: [app.authenticate] }, deletePhoto)
}
