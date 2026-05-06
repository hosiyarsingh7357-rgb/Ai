import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'
import { EmotionalState } from '@prisma/client'

export interface CreateJournalNoteInput {
  date: string
  content: string
  mood?: EmotionalState
  marketBias?: string
  tradeId?: string
}

export async function listJournalNotes(userId: string, dateFrom?: string, dateTo?: string) {
  return prisma.journalNote.findMany({
    where: {
      userId,
      ...(dateFrom || dateTo ? {
        date: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) })
        }
      } : {})
    },
    orderBy: { date: 'desc' },
    include: {
      trade: {
        select: {
          id: true,
          symbol: true,
          netPnl: true
        }
      }
    }
  })
}

export async function createJournalNote(userId: string, data: CreateJournalNoteInput) {
  return prisma.journalNote.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId
    }
  })
}

export async function updateJournalNote(id: string, userId: string, data: Partial<CreateJournalNoteInput>) {
  const note = await prisma.journalNote.findFirst({ where: { id, userId } })
  if (!note) throw ApiError.notFound('Journal note')
  
  return prisma.journalNote.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined
    }
  })
}

export async function deleteJournalNote(id: string, userId: string) {
  const note = await prisma.journalNote.findFirst({ where: { id, userId } })
  if (!note) throw ApiError.notFound('Journal note')
  
  return prisma.journalNote.delete({
    where: { id }
  })
}
