import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GenLayer Intelligent Finance Studio',
  description: 'A GenLayer-ready finance studio for live market intelligence, AI report provenance, trade-intent policy checks, and local bot monitoring.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
