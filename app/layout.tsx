import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import Providers from './providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Synapto — AI Study Platform',
  description: 'Your AI-native student productivity platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="synapto-theme"
        >
          <TooltipProvider>
            <Providers>{children}</Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
