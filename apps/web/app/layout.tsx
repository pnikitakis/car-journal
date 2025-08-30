import './globals.css'
import type { Metadata } from 'next'
import React from 'react'
import { AppLayout } from '../src/components/app-layout'

export const metadata: Metadata = {
  title: 'Car Journal',
  description: 'A media-first car logbook for tracking maintenance and incidents',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Car Journal" />
      </head>
      <body className="antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}

