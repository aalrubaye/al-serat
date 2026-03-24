import './globals.css'
import Footer from '../components/Footer'
import { IBM_Plex_Sans_Arabic, Readex_Pro } from 'next/font/google'

const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const headingFont = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata = {
  title: 'الصراط | Al-Serat',
  description: 'موقع الصراط',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body>
        <div className="site-shell">
          <div className="site-content">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  )
}
