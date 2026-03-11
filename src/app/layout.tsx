import type { Metadata } from 'next';
import { Assistant, Heebo } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  variable: '--font-assistant',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew'],
  variable: '--font-heebo',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'הזמנה לחתונה',
  description: 'מערכת ניהול אורחים לחתונה',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.variable} ${heebo.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
