import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Navbar from '@/components/navbar';
import ThemeProvider from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
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
          <div className='w-full flex justify-center min-h-screen'>
            <div className='max-w-[1200px] overflow-auto m-8 mb-0'>
              <div className='w-fit'>{children}</div>
            </div>
            <Navbar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
