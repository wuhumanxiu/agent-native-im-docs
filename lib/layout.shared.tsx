import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'ANI Docs',
      url: '/',
    },
    links: [
      {
        text: 'Agent-Native IM',
        url: 'https://agent-native.im',
        active: 'none',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/wuhumanxiu/agent-native-im',
        active: 'none',
      },
    ],
  };
}
