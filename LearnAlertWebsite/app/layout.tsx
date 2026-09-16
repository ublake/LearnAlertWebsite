import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'LearnAlert — A little learning, wherever life happens',
  description: 'Create a flashcard deck, set your schedule, and study right from your notifications. LearnAlert makes learning fit into your day.',
  icons: { icon: '/LearnAlertLogo.png', apple: '/LearnAlertLogo.png' },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
