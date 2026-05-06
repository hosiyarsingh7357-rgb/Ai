import Razorpay from 'razorpay';
import { env } from './environment';

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || '',
  key_secret: env.RAZORPAY_KEY_SECRET || '',
});

export const RAZORPAY_PLANS = {
  proMonthly: env.RAZORPAY_PRO_MONTHLY_PLAN_ID || '',
  proAnnual: env.RAZORPAY_PRO_ANNUAL_PLAN_ID || '',
  eliteMonthly: env.RAZORPAY_ELITE_MONTHLY_PLAN_ID || '',
  eliteAnnual: env.RAZORPAY_ELITE_ANNUAL_PLAN_ID || '',
};
