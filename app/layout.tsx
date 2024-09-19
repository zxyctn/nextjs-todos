import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

import Navbar from '@/components/navbar';
import NavbarMobile from '@/components/navbar-mobile';
import ThemeProvider from '@/components/theme-provider';
import Providers from '@/components/providers';
import { getSession } from '@/auth';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '_todos',
  description: 'A simple Next.js todo app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <div className='flex justify-center h-screen w-screen'>
              <div className='max-w-[1400px] overflow-auto'>
                <div className='w-fit'>{children}</div>
              </div>
              <Navbar />
              <NavbarMobile />
            </div>
            <Toaster richColors position='top-right' />
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
