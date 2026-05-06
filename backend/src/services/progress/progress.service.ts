import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'

export async function listProgressGoals(userId: string) {
  return prisma.progressGoal.findMany({
    where: { userId },
    orderBy: { endDate: 'asc' }
  })
}

export async function createProgressGoal(userId: string, data: any) {
  return prisma.progressGoal.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      userId
    }
  })
}

export async function updateProgressGoal(id: string, userId: string, data: any) {
  const goal = await prisma.progressGoal.findFirst({ where: { id, userId } })
  if (!goal) throw ApiError.notFound('Goal')
  
  return prisma.progressGoal.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    }
  })
}

export async function deleteProgressGoal(id: string, userId: string) {
  const goal = await prisma.progressGoal.findFirst({ where: { id, userId } })
  if (!goal) throw ApiError.notFound('Goal')
  
  return prisma.progressGoal.delete({
    where: { id }
  })
}
