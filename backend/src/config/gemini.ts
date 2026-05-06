import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from './environment.js'

export const geminiClient = env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY)
  : null

export function getGeminiModel(model: 'gemini-1.5-pro' | 'gemini-1.5-flash') {
  if (!geminiClient) throw new Error('GOOGLE_AI_API_KEY not configured')
  return geminiClient.getGenerativeModel({ model })
}
