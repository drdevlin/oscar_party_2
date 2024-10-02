import { Arsenal } from 'next/font/google';

import type { Metadata } from 'next';

import './globals.css';

const arsenal = Arsenal({ weight: ['400', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Oscar Party",
  description: "Your interactive Oscar ballot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={arsenal.className}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
