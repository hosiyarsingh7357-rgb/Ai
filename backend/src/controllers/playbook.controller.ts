import { Request, Response } from 'express'
import prisma from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'

export class PlaybookController {
  async createPlaybook(req: Request, res: Response) {
    const userId = (req as any).user?.id
    if (!userId) throw ApiError.unauthorized()

    // Tier-based limits check
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const tier = user?.subscriptionTier || 'free'
    
    if (tier === 'free') {
      throw ApiError.upgradeRequired('pro', 'Free users cannot create private playbooks. Upgrade to Pro to build your strategy library.')
    }

    const playbookCount = await prisma.playbook.count({
      where: { userId, isActive: true }
    })

    if (tier === 'pro' && playbookCount >= 3) {
      throw ApiError.upgradeRequired('elite', 'Pro tier is limited to 3 private playbooks. Upgrade to Elite for unlimited strategies.')
    }

    const { name, description, setupType, entryRules, exitRules, riskRules, markets, timeframes, isPublic } = req.body

    if (!name || !setupType) {
      throw ApiError.badRequest('Name and Setup Type are required')
    }

    const playbook = await prisma.playbook.create({
      data: {
        userId,
        name,
        description,
        setupType,
        entryRules: entryRules || '',
        exitRules: exitRules || '',
        riskRules: riskRules || '',
        markets: markets || [],
        timeframes: timeframes || [],
        isPublic: !!isPublic,
      },
    })

    return res.status(201).json({ data: playbook, message: 'Playbook created successfully' })
  }

  async getPlaybooks(req: Request, res: Response) {
    const userId = (req as any).user?.id
    if (!userId) throw ApiError.unauthorized()

    const playbooks = await prisma.playbook.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ApiResponse.success(res, playbooks)
  }

  async getPublicPlaybooks(req: Request, res: Response) {
    const playbooks = await prisma.playbook.findMany({
      where: {
        isActive: true,
        OR: [
          { isPublic: true },
          { isFeatured: true }
        ]
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            name: true,
            subscriptionTier: true
          }
        }
      }
    })

    return ApiResponse.success(res, playbooks)
  }

  async updatePlaybook(req: Request, res: Response) {
    const userId = (req as any).user?.id
    const { id } = req.params as { id: string }
    const updates = req.body

    const playbook = await prisma.playbook.findUnique({
      where: { id },
    })

    if (!playbook || playbook.userId !== userId) {
      throw ApiError.notFound('Playbook')
    }

    const updatedPlaybook = await prisma.playbook.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    return res.status(200).json({ data: updatedPlaybook, message: 'Playbook updated successfully' })
  }

  async deletePlaybook(req: Request, res: Response) {
    const userId = (req as any).user?.id
    const { id } = req.params as { id: string }

    const playbook = await prisma.playbook.findUnique({
      where: { id },
    })

    if (!playbook || playbook.userId !== userId) {
      throw ApiError.notFound('Playbook')
    }

    await prisma.playbook.update({
      where: { id },
      data: { isActive: false },
    })

    return ApiResponse.message(res, 'Playbook deleted successfully')
  }
}
