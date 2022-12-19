import { useRoutes } from 'react-router-dom';
import {
  DesktopOutlined,
  BulbOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import General from '@view/General';
import LanguageModel from '@/view/LanguageModel';
import SyncPrompts from '@/view/SyncPrompts';

export type ChatRouteMetaObject = {
  label: string;
  icon?: React.ReactNode,
};

type ChatRouteObject = {
  path: string;
  element?: JSX.Element;
  meta: ChatRouteMetaObject;
  children?: ChatRouteObject[];
}

export const routes: Array<ChatRouteObject> = [
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
    meta: {
      label: 'Language Model',
      icon: <BulbOutlined />,
    },
    children: [
      {
        path: 'user-custom',
        element: <LanguageModel />,
        meta: {
          label: 'User Custom',
          icon: <UserOutlined />,
        },
      },
      {
        path: 'sync-prompts',
        element: <SyncPrompts />,
        meta: {
          label: 'Sync Prompts',
          icon: <SyncOutlined />,
        },
      },
    ]
  },
];

type MenuItem = Required<MenuProps>['items'][number];
export const menuItems: MenuItem[] = routes.map(i => ({
  ...i.meta,
  key: i.path || '',
  children: i?.children?.map((j) =>
    ({ ...j.meta, key: `${i.path}/${j.path}` || ''})),
}));

export default () => {
  return useRoutes(routes);
};