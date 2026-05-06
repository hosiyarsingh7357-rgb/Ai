import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { brokerService } from '../services/broker/broker.service.js';

export const listConnections = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;
  const connections = await brokerService.listConnections(userId);
  res.status(200).json(connections);
});

export const addConnection = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;
  const connection = await brokerService.addConnection(userId, req.body);
  res.status(201).json(connection);
});

export const deleteConnection = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  await brokerService.deleteConnection(userId, id);
  res.status(204).end();
});

export const syncConnection = asyncHandler(async (req: any, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await brokerService.triggerSync(userId, id);
  res.status(200).json(result);
});
