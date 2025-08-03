import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'
import FCMProvider from '@/components/FCMProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Freny Bridal Studio - Beauty Parlor Management',
  description: 'Professional beauty parlor management system for Freny Bridal Studio',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <FCMProvider>
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </FCMProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
