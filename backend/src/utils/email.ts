import { Resend } from 'resend'
import { env } from '../config/environment.js'
import { logger } from './logger.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  if (!resend) {
    logger.warn('RESEND_API_KEY not set. Skipping email sending.')
    logger.info({ to, subject }, 'Email content (not sent):')
    return
  }

  try {
    const data = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    logger.info({ emailId: data.data?.id }, 'Email sent successfully')
    return data
  } catch (error) {
    logger.error({ error }, 'Failed to send email')
    throw error
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`
  
  await sendEmail({
    to: email,
    subject: 'Reset your Trade Journal password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  })
}
