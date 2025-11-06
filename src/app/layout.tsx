'use client'
import './globals.css'
import '@/app/css/layout.css'
import Link from 'next/link'
import Image from 'next/image'
import Footer from "@/app/components/footer";
import DottedBackground from '@/app/components/dottedbackground'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Kalbos kontekstas
import LanguageProviderClient from "./kalbos/LanguageProviderClient";
import { useLanguage } from "./kalbos/LanguageContext";
import { LanguageSwitch } from "./kalbos/LanguageSwitch";

const menuItems = {
  LT: [
    { label: "APIE MUS", id: "apie-mus" },
    { label: "PASLAUGOS", id: "musu-paslaugos" },
    { label: "PATIRTIS", id: "patirtis" },
    { label: "PARTNERIAI", id: "partneriai" },
    { label: "KARJERA", id: "karjera" },
    { label: "KONTAKTAI", id: "kontaktai" },
  ],
  EN: [
    { label: "ABOUT US", id: "apie-mus" },
    { label: "SERVICES", id: "musu-paslaugos" },
    { label: "EXPERIENCE", id: "patirtis" },
    { label: "PARTNERS", id: "partneriai" },
    { label: "CAREERS", id: "karjera" },
    { label: "CONTACTS", id: "kontaktai" },
  ],
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLanguage(); // 👈 veikia, nes jau apgaubtas provider’iu

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const updateHeaderHeight = () => {
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height-px', `${h}px`);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const noHeaderPages = ["/patirtis-placiau", "/karjera-placiau", "/admin"];
  const hideHeader = noHeaderPages.some((p) => pathname.startsWith(p));

  const noFooterPages = ["/admin"];
  const hideFooter = noFooterPages.some((p) => pathname.startsWith(p));

  return (
    <>
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
                width={500}
                height={100}
                style={{ width: "7vw", height: "7vh" }}
              />
            </Link>

            <ul className="menu">
              {menuItems[lang].map(({ label, id }) => (
                <li key={id}>
                  <Link href={`#${id}`} scroll={true} className="menu-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="ml-4">
              <LanguageSwitch />
            </div>
          </nav>
        </header>
      )}

      <main
        className="main overflow-y-auto"
        style={{ paddingTop: hideHeader ? '0' : 'var(--header-height-px)' }}
      >
        {children}
        {!hideFooter && <Footer />}
      </main>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <body className="min-h-screen flex flex-col">
        {/* 👇 PROVIDER apgaubia visą Layout turinį */}
        <LanguageProviderClient>
          <LayoutContent>{children}</LayoutContent>
        </LanguageProviderClient>
      </body>
    </html>
  );
}
