import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import 'fumadocs-ui/style.css';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'ANI Docs',
    template: '%s | ANI Docs',
  },
  description: 'Agent-Native IM product, agent integration, and protocol documentation.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <RootProvider>
          <DocsLayout {...baseOptions()} tree={source.getPageTree()}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
