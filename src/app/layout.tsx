'use client'
import './globals.css'
import '@/app/css/layout.css'
import Link from 'next/link'
import Image from 'next/image'
import Footer from "@/app/components/footer";
import DottedBackground from '@/app/components/dottedbackground'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const menuItems = [
  { label: 'APIE MUS', id: 'apie-mus' },
  { label: 'PASLAUGOS', id: 'musu-paslaugos' },
  { label: 'PATIRTIS', id: 'patirtis' },
  { label: 'PARTNERIAI', id: 'partneriai' },
  { label: 'KARJERA', id: 'karjera' },
  { label: 'KONTAKTAI', id: 'kontaktai' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const header = document.querySelector('header')
    if (!header) return
    const updateHeaderHeight = () => {
      const h = header.getBoundingClientRect().height
      document.documentElement.style.setProperty('--header-height-px', `${h}px`)
    }
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [])

  // Hide header on this page (and its subpages)
  const noHeaderPages = ["/patirtis-placiau", "/karjera-placiau"];
  const hideHeader = noHeaderPages.some((p) => pathname.startsWith(p));

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <DottedBackground spacing={20} dotColor="#000000" />

        {!hideHeader && (
          <header
            className="header"
            style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}
          >
            <nav className="nav">
              <Link href="/" className="logo-link">
                <Image
                  src="/EMRC-1.svg"
                  alt="ERMC logo"
                  width={500}  // intrinsic size for layout (must be a number)
                  height={100}
                  style={{ width: "7vw", height: "7vh" }} // override rendered size
                />
              </Link>
              <ul className="menu">
                {menuItems.map(({ label, id }) => (
                  <li key={id}>
                    <Link href={`#${id}`} scroll={true} className="menu-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </header>
        )}

        {/* main turi padding-top, kad pradžia nebūtų po headeriu */}
        <main className="main overflow-y-auto" style={{ paddingTop: hideHeader ? '0' : 'var(--header-height-px)' }}>
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
