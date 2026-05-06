import { Resend } from 'resend'
import { env } from './environment.js'

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null
export const EMAIL_FROM = env.EMAIL_FROM
