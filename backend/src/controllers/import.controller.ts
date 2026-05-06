import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { importService } from '../services/import/import.service';

export const importTrades = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { accountId, brokerType } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  if (!accountId || !brokerType) {
    res.status(400).json({ message: 'Missing accountId or brokerType' });
    return;
  }

  const csvContent = file.buffer.toString('utf-8');
  const result = await importService.importTrades(userId, accountId, brokerType, csvContent);

  res.status(200).json({
    message: 'Import completed successfully',
    data: result
  });
});

export const previewImport = asyncHandler(async (req: Request, res: Response) => {
  const { brokerType } = req.body;
  const file = req.file;

  if (!file || !brokerType) {
    res.status(400).json({ message: 'Missing file or brokerType' });
    return;
  }

  const csvContent = file.buffer.toString('utf-8');
  const result = await importService.previewImport(brokerType, csvContent);

  res.status(200).json({
    message: 'Preview generated',
    data: result
  });
});
