import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

async function ensureDir(dir: string) {
  try { await fs.mkdir(dir, { recursive: true }) } catch {}
}

export async function uploadPhoto(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await request.file()
  if (!data) {
    return reply.status(400).send({ success: false, message: 'No file uploaded' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(data.mimetype)) {
    return reply.status(400).send({ success: false, message: 'Only JPEG, PNG, and WebP images are allowed' })
  }

  await ensureDir(UPLOAD_DIR)

  const buffer = await data.toBuffer()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const filepath = path.join(UPLOAD_DIR, filename)

  // Compress and convert to WebP
  await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath)

  const url = `/uploads/${filename}`
  return reply.send({ success: true, data: { url, filename } })
}

export async function deletePhoto(
  request: FastifyRequest<{ Params: { filename: string } }>,
  reply: FastifyReply
) {
  const { filename } = request.params
  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return reply.status(400).send({ success: false, message: 'Invalid filename' })
  }

  const filepath = path.join(UPLOAD_DIR, filename)
  try {
    await fs.unlink(filepath)
  } catch {}

  return reply.send({ success: true })
}
