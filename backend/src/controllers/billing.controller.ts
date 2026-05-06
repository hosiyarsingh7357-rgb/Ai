import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { razorpayService } from '../services/billing/razorpay.service';

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { planType, interval } = req.body; // planType: 'pro' | 'elite', interval: 'monthly' | 'annual'

  const subscription = await razorpayService.createSubscription(userId, planType, interval);
  res.status(200).json(subscription);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = req.body;

  const result = await razorpayService.verifyPayment(
    userId,
    razorpayPaymentId,
    razorpaySubscriptionId,
    razorpaySignature
  );
  res.status(200).json(result);
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const result = await razorpayService.handleWebhook(req.body, signature);
  res.status(200).json(result);
});
