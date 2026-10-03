import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { AuthGate } from '../components/AuthGate';
export const metadata: Metadata = { title: 'Funspot', description: 'Social moments, powered by people.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers><AuthGate>{children}</AuthGate></Providers></body></html>; }
