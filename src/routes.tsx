import { useRoutes } from 'react-router-dom';
import {
  DesktopOutlined,
  BulbOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { RouteObject } from 'react-router-dom';
import type { MenuProps } from 'antd';

import General from '@view/General';
import LanguageModel from '@/view/LanguageModel';
import SyncPrompts from '@/view/SyncPrompts';

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
    path: '/language-model',
    element: <LanguageModel />,
    meta: {
      label: 'Language Model',
      icon: <BulbOutlined />,
    },
  },
  {
    path: '/sync-prompts',
    element: <SyncPrompts />,
    meta: {
      label: 'Sync Prompts',
      icon: <SyncOutlined />,
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