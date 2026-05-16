import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { source } from '@/lib/source';

type DocMeta = {
  category?: string;
  updated?: string;
  readingTime?: string;
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug ?? []);

  if (!page) {
    notFound();
  }

  const MDX = page.data.body;
  const meta = page.data as typeof page.data & DocMeta;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="docs-meta-row">
        <span>{meta.category ?? '开始使用'}</span>
        <span className="docs-meta-separator" />
        <span>{meta.updated ?? '2026 年 5 月更新'}</span>
        <span className="docs-meta-separator" />
        <span>{meta.readingTime ?? '阅读约 6 分钟'}</span>
      </div>
      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug ?? []);

  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
