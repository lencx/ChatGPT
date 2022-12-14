import { useRoutes } from 'react-router-dom';
import {
  DesktopOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { RouteObject } from 'react-router-dom';
import type { MenuProps } from 'antd';

import General from '@view/General';
import ChatGPTPrompts from '@view/ChatGPTPrompts';

export type ChatRouteObject = {
  label: string;
  icon?: React.ReactNode,
};

export const routes: Array<RouteObject & { meta: ChatRouteObject }> = [
  {
    path: '/',
    element: <General />,
    meta: {
      label: 'General',
      icon: <DesktopOutlined />,
    },
  },
  {
    path: '/chatgpt-prompts',
    element: <ChatGPTPrompts />,
    meta: {
      label: 'ChatGPT Prompts',
      icon: <BulbOutlined />,
    },
  },
];

type MenuItem = Required<MenuProps>['items'][number];
export const menuItems: MenuItem[] = routes.map(i => ({
  ...i.meta,
  key: i.path || '',
}));

export default () => {
  return useRoutes(routes);
};