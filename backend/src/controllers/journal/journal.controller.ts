import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as journalService from '../../services/journal/journal.service.js'

export const getJournalNotes = asyncHandler(async (req: Request, res: Response) => {
  const { dateFrom, dateTo } = req.query
  const notes = await journalService.listJournalNotes((req as any).user.id, dateFrom as string, dateTo as string)
  res.json({ status: 'success', data: notes })
})

export const createJournalNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await journalService.createJournalNote((req as any).user.id, req.body)
  res.status(201).json({ status: 'success', data: note })
})

export const updateJournalNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await journalService.updateJournalNote(req.params.id!, (req as any).user.id, req.body)
  res.json({ status: 'success', data: note })
})

export const deleteJournalNote = asyncHandler(async (req: Request, res: Response) => {
  await journalService.deleteJournalNote(req.params.id!, (req as any).user.id)
  res.status(204).json({ status: 'success', data: null })
})
