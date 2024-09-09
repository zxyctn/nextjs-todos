import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Loading from '@/components/loading';
import Navbar from '@/components/navbar';
import ThemeProvider from '@/components/theme-provider';

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
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Loading />
          <div className='w-full flex justify-center min-h-screen'>
            <div className='max-w-[1400px] overflow-auto mt-4 sm:mt-8 mb-0'>
              <div className='w-fit'>{children}</div>
            </div>
            <Navbar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
