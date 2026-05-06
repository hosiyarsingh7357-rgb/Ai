import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as tagsService from '../../services/tags/tags.service.js'

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await tagsService.listTags((req as any).user.id)
  res.json({ status: 'success', data: tags })
})

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagsService.createTag((req as any).user.id, req.body)
  res.status(201).json({ status: 'success', data: tag })
})

export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await tagsService.updateTag(req.params.id!, (req as any).user.id, req.body)
  res.json({ status: 'success', data: tag })
})

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  await tagsService.deleteTag(req.params.id!, (req as any).user.id)
  res.status(204).json({ status: 'success', data: null })
})
