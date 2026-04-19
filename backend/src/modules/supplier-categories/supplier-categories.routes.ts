import { FastifyInstance } from 'fastify'
import { listSupplierCategories, createSupplierCategory, deleteSupplierCategory } from './supplier-categories.controller.js'

export default async function supplierCategoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate)

  app.get('/', listSupplierCategories)
  app.post('/', createSupplierCategory)
  app.delete('/:id', deleteSupplierCategory)
}
