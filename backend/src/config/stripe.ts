import Stripe from 'stripe'
import { env } from './environment.js'

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript: true,
    })
  : null

export const STRIPE_PRICES = {
  proMonthly: env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  proAnnual: env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  eliteMonthly: env.STRIPE_PRICE_ELITE_MONTHLY ?? '',
  eliteAnnual: env.STRIPE_PRICE_ELITE_ANNUAL ?? '',
}
