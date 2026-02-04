import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Default metadata for the app
export const metadata: Metadata = {
  title: 'Task-O | Task Management Website',
  description: 'Professional task and project management application',
}

import { ThemeProvider } from '@/components/ThemeProvider'
import { SidebarProvider } from '@/components/SidebarContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}