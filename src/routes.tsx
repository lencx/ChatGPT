import { useRoutes } from 'react-router-dom';
import {
  SettingOutlined,
  BulbOutlined,
  SyncOutlined,
  FileSyncOutlined,
  UserOutlined,
  FormOutlined,
  InfoCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import Settings from '@/view/settings';
import About from '@/view/about';
import Scripts from '@/view/scripts';
import UserCustom from '@/view/prompts/UserCustom';
import SyncPrompts from '@/view/prompts/SyncPrompts';
import SyncCustom from '@/view/prompts/SyncCustom';
import SyncRecord from '@/view/prompts/SyncRecord';
import Notes from '@/view/notes';
import Markdown from '@/view/markdown';

export type ChatRouteMetaObject = {
  label: string;
  icon?: React.ReactNode;
};

type ChatRouteObject = {
  path: string;
  element?: JSX.Element;
  hideMenu?: boolean;
  meta?: ChatRouteMetaObject;
  children?: ChatRouteObject[];
};

export const routes: Array<ChatRouteObject> = [
  {
    path: '/settings',
    element: <Settings />,
    meta: {
      label: 'Settings',
      icon: <SettingOutlined />,
    },
  },
  {
    path: '/notes',
    element: <Notes />,
    meta: {
      label: 'Notes',
      icon: <FormOutlined />,
    },
  },
  {
    path: '/md/:id',
    element: <Markdown />,
    hideMenu: true,
  },
  {
    path: '/prompts',
    meta: {
      label: 'Prompts',
      icon: <BulbOutlined />,
    },
    children: [
      {
        path: 'user-custom',
        element: <UserCustom />,
        meta: {
          label: 'User Custom',
          icon: <UserOutlined />,
        },
      },
      // --- Sync
      {
        path: 'sync-prompts',
        element: <SyncPrompts />,
        meta: {
          label: 'Sync Prompts',
          icon: <SyncOutlined />,
        },
      },
      {
        path: 'sync-custom',
        element: <SyncCustom />,
        meta: {
          label: 'Sync Custom',
          icon: <FileSyncOutlined />,
        },
      },
      {
        path: 'sync-custom/:id',
        element: <SyncRecord />,
        hideMenu: true,
      },
    ],
  },
  {
    path: '/scripts',
    element: <Scripts />,
    meta: {
      label: 'Scripts',
      icon: <CodeOutlined />,
    },
  },
  {
    path: '/about',
    element: <About />,
    meta: {
      label: 'About',
      icon: <InfoCircleOutlined />,
    },
  },
  {
    path: '/',
    element: <Settings />,
  },
];

type MenuItem = Required<MenuProps>['items'][number];
export const menuItems: MenuItem[] = routes
  .filter((j) => !j.hideMenu)
  .map((i) => ({
    ...i.meta,
    key: i.path || '',
    children: i?.children
      ?.filter((j) => !j.hideMenu)
      ?.map((j) => ({ ...j.meta, key: `${i.path}/${j.path}` || '' })),
  }));

export default () => {
  return useRoutes(routes);
};
