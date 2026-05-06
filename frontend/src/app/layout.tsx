import type { Metadata } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#00FF87',
  title: {
    default: 'Trade Journal | Professional AI Trading Journal & Performance Analytics',
    template: '%s | Trade Journal',
  },
  description:
    'The most advanced AI-powered trading journal. Auto-sync brokers, analyze emotional patterns, and get behavioral coaching powered by Google Gemini.',
  keywords: ['trading journal', 'AI trading coach', 'trade tracking', 'TradeStation journal', 'trading performance', 'profitable trading'],
  authors: [{ name: 'Trade Journal Team' }],
  metadataBase: new URL('https://trade-journal.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trade-journal.ai',
    title: 'Trade Journal | AI-Powered Trading Performance Platform',
    description: 'Stop losing money to patterns you haven\'t seen yet. Get behavioral coaching and automated broker sync.',
    siteName: 'Trade Journal',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trade Journal UI Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade Journal | AI-Powered Trading Performance',
    description: 'Transform your trading with the world\'s most intelligent journal.',
    images: ['/og-image.png'],
    creator: '@tradejournal_ai',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

import { Providers } from '@/components/Providers'
import { PWARegistry } from '@/components/PWARegistry'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <PWARegistry />
          {children}
        </Providers>
      </body>
    </html>
  )
}
