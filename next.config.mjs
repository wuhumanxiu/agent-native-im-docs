import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/docs',
  output: 'standalone',
};

export default withMDX(nextConfig);
