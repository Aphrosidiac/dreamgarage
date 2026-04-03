import Fastify from 'fastify'
import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { env } from './config/env.js'
import prismaPlugin from './plugins/prisma.js'
import authPlugin from './plugins/auth.js'
import errorHandlerPlugin from './plugins/error-handler.js'
import authRoutes from './modules/auth/auth.routes.js'
import categoryRoutes from './modules/categories/categories.routes.js'
import stockRoutes from './modules/stock/stock.routes.js'
import documentRoutes from './modules/documents/documents.routes.js'
import settingsRoutes from './modules/document-settings/settings.routes.js'
import paymentTermRoutes from './modules/payment-terms/terms.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import customerRoutes from './modules/customers/customers.routes.js'
import brandRoutes from './modules/brands/brands.routes.js'
import workerRoutes from './modules/workers/workers.routes.js'
import debtorRoutes from './modules/debtors/debtors.routes.js'
import reportRoutes from './modules/reports/reports.routes.js'

const isProd = env.NODE_ENV === 'production'

const app = Fastify({
  logger: isProd
    ? { level: 'info' }
    : { transport: { target: 'pino-pretty', options: { colorize: true } } },
})

async function start() {
  // Security
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  // Plugins
  await app.register(cors, {
    origin: isProd ? env.CORS_ORIGIN.split(',') : env.CORS_ORIGIN,
    credentials: true,
  })
  await app.register(formbody)
  await app.register(prismaPlugin)
  await app.register(authPlugin)
  await app.register(errorHandlerPlugin)

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(categoryRoutes, { prefix: '/api/v1/categories' })
  await app.register(stockRoutes, { prefix: '/api/v1/stock' })
  await app.register(documentRoutes, { prefix: '/api/v1/documents' })
  await app.register(settingsRoutes, { prefix: '/api/v1/document-settings' })
  await app.register(paymentTermRoutes, { prefix: '/api/v1/payment-terms' })
  await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
  await app.register(profileRoutes, { prefix: '/api/v1/profile' })
  await app.register(customerRoutes, { prefix: '/api/v1/customers' })
  await app.register(brandRoutes, { prefix: '/api/v1/brands' })
  await app.register(workerRoutes, { prefix: '/api/v1/workers' })
  await app.register(debtorRoutes, { prefix: '/api/v1/debtors' })
  await app.register(reportRoutes, { prefix: '/api/v1/reports' })

  // Health check
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Start
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`\n  Dream Garage API running on http://localhost:${env.PORT}\n`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
