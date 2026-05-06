import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userSettings: true,
      _count: {
        select: {
          trades: true,
          tradingAccounts: true
        }
      }
    }
  })
  if (!user) throw ApiError.notFound('User')
  
  // Remove sensitive data
  const { passwordHash, ...safeUser } = user
  return safeUser
}

export async function updateProfile(userId: string, data: { name?: string, timezone?: string, defaultCurrency?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      timezone: true,
      defaultCurrency: true,
      onboardingCompleted: true
    }
  })
}

export async function updateSettings(userId: string, data: any) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: {
      ...data,
      userId
    }
  })
}

export async function deleteAccount(userId: string) {
  // Prisma onDelete: Cascade should handle related data
  return prisma.user.delete({
    where: { id: userId }
  })
}
