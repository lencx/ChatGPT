import { Tag, Tooltip } from 'antd';

export const columns = [
  {
    title: 'Command',
    dataIndex: 'cmd',
    key: 'cmd',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (v: string) => <Tag>{v}</Tag>
  },
  {
    title: 'Content',
    dataIndex: 'content',
    key: 'content',
    render: (v: string) => (
      <Tooltip overlayInnerStyle={{ width: 350 }} title={v}><span className="chat-prompts-val">{v}</span></Tooltip>
    ),
  },
];
