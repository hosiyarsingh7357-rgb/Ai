import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'

export async function listTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' }
  })
}

export async function createTag(userId: string, data: { name: string, color?: string, category?: string }) {
  // Check if tag with same name exists for user
  const existing = await prisma.tag.findFirst({
    where: { userId, name: { equals: data.name, mode: 'insensitive' } }
  })
  
  if (existing) throw ApiError.badRequest('Tag with this name already exists')
  
  return prisma.tag.create({
    data: {
      ...data,
      userId
    }
  })
}

export async function updateTag(id: string, userId: string, data: { name?: string, color?: string, category?: string }) {
  const tag = await prisma.tag.findFirst({ where: { id, userId } })
  if (!tag) throw ApiError.notFound('Tag')
  
  if (data.name) {
    const existing = await prisma.tag.findFirst({
      where: { userId, name: { equals: data.name, mode: 'insensitive' }, NOT: { id } }
    })
    if (existing) throw ApiError.badRequest('Tag with this name already exists')
  }
  
  return prisma.tag.update({
    where: { id },
    data
  })
}

export async function deleteTag(id: string, userId: string) {
  const tag = await prisma.tag.findFirst({ where: { id, userId } })
  if (!tag) throw ApiError.notFound('Tag')
  
  return prisma.tag.delete({
    where: { id }
  })
}
