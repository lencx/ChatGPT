import { Table, Switch, Tag } from 'antd';

import { genCmd } from '@/utils';

export const syncColumns = () => [
  {
    title: '/{cmd}',
    dataIndex: 'cmd',
    fixed: 'left',
    key: 'cmd',
    render: (_: string, row: Record<string, string>) => (
      <Tag color="#2a2a2a">/{genCmd(row.act)}</Tag>
    ),
  },
  {
    title: 'Act',
    dataIndex: 'act',
    key: 'act',
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    render: () => <Tag>built-in</Tag>,
  },
  {
    title: 'Enable',
    dataIndex: 'enable',
    key: 'enable',
    render: (v: boolean = false, row: Record<string, any>, action: Record<string, any>) => (
      <Switch checked={v} onChange={(v) => action.setRecord({ ...row, enable: v }, 'enable')} />
    ),
  },
  Table.EXPAND_COLUMN,
  {
    title: 'Prompt',
    dataIndex: 'prompt',
    key: 'prompt',
    render: (v: string) => <span className="chat-prompts-val">{v}</span>,
  },
];
