import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default branch
  const branch = await prisma.branch.upsert({
    where: { code: 'DG-JB' },
    update: {},
    create: {
      name: 'Dream Garage JB',
      code: 'DG-JB',
      address: '22, Jalan Mutiara Emas 5/1, Taman Mount Austin, 81100 Johor Bahru, Johor',
      phone: '+60 18-207 8080',
      email: 'dreamgarage@gmail.com',
    },
  })
  console.log(`Branch created: ${branch.name}`)

  // Create admin user
  const passwordHash = await bcryptjs.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@dreamgarage.my' },
    update: {},
    create: {
      branchId: branch.id,
      email: process.env.ADMIN_EMAIL || 'admin@dreamgarage.my',
      passwordHash,
      name: process.env.ADMIN_NAME || 'Admin',
      role: 'ADMIN',
    },
  })
  console.log(`Admin user created: ${admin.email}`)

  // Create default stock categories
  const categories = [
    { name: 'Tyres', code: 'TYR' },
    { name: 'Engine Oil', code: 'OIL' },
    { name: 'Brake Parts', code: 'BRK' },
    { name: 'Filters', code: 'FLT' },
    { name: 'Battery', code: 'BAT' },
    { name: 'Suspension', code: 'SUS' },
    { name: 'Alignment & Balancing', code: 'ALN' },
    { name: 'Air-Con Parts', code: 'AC' },
    { name: 'Others', code: 'OTH' },
  ]

  for (const cat of categories) {
    await prisma.stockCategory.upsert({
      where: { branchId_name: { branchId: branch.id, name: cat.name } },
      update: {},
      create: {
        branchId: branch.id,
        name: cat.name,
        code: cat.code,
      },
    })
  }
  console.log(`${categories.length} categories created`)

  // Create default document settings
  const docTypes = [
    { type: 'QUOTATION' as const, prefix: 'QT', label: 'Quotation' },
    { type: 'INVOICE' as const, prefix: 'INV', label: 'Invoice' },
    { type: 'RECEIPT' as const, prefix: 'RCP', label: 'Receipt' },
    { type: 'DELIVERY_ORDER' as const, prefix: 'DO', label: 'Delivery Order' },
  ]

  for (const doc of docTypes) {
    await prisma.documentSetting.upsert({
      where: { branchId_documentType: { branchId: branch.id, documentType: doc.type } },
      update: {},
      create: {
        branchId: branch.id,
        documentType: doc.type,
        prefix: doc.prefix,
        documentLabel: doc.label,
        templateColor: '#FFD700',
        defaultNotes: doc.type === 'INVOICE'
          ? '1. ALL GOODS SOLD ARE NOT RETURNABLE. RM50.00 (1PC) WILL BE CHARGED FOR CANCELLATION.\n2. ALL CHEQUES SHOULD BE CROSSED AND MADE PAYABLE TO: DREAM GARAGE (M) SDN BHD'
          : undefined,
        defaultTerms: doc.type === 'QUOTATION'
          ? 'This quotation is valid for 30 days from the date of issue.'
          : undefined,
      },
    })
  }
  console.log(`${docTypes.length} document settings created`)

  // Create default payment terms
  const paymentTerms = [
    { name: 'Due on Receipt', days: 0, isDefault: true },
    { name: 'Net 7', days: 7 },
    { name: 'Net 14', days: 14 },
    { name: 'Net 30', days: 30 },
  ]

  for (const term of paymentTerms) {
    const existing = await prisma.paymentTerm.findFirst({
      where: { branchId: branch.id, name: term.name },
    })
    if (!existing) {
      await prisma.paymentTerm.create({
        data: {
          branchId: branch.id,
          name: term.name,
          days: term.days,
          isDefault: term.isDefault || false,
        },
      })
    }
  }
  console.log(`${paymentTerms.length} payment terms created`)

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
