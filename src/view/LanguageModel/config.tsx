import { Tag, Switch, Tooltip, Space } from 'antd';

export const modelColumns = () => [
  {
    title: 'Act',
    dataIndex: 'act',
    key: 'act',
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    render: (v: string[]) => v?.map(i => <Tag key={i}>{i}</Tag>),
  },
  {
    title: 'Enable',
    dataIndex: 'enable',
    key: 'enable',
    render: (v: boolean = false) => <Switch checked={v} disabled />,
  },
  {
    title: 'Prompt',
    dataIndex: 'prompt',
    key: 'prompt',
    render: (v: string) => (
      <Tooltip overlayInnerStyle={{ width: 350 }} title={v}><span className="chat-prompts-val">{v}</span></Tooltip>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (_: any, row: any, actions: any) => (
      <Space size="middle">
        <a onClick={() => actions.setRecord(row, 'edit')}>Edit</a>
        <a onClick={() => actions.setRecord(row, 'delete')}>Delete</a>
      </Space>
    ),
  }
];
