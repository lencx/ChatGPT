import { Tag, Space, Popconfirm, Switch } from 'antd';

export const awesomeColumns = () => [
  {
    title: 'Title',
    dataIndex: 'title',
    fixed: 'left',
    key: 'title',
    width: 160,
  },
  {
    title: 'URL',
    dataIndex: 'url',
    key: 'url',
    width: 120,
  },
  // {
  //   title: 'Icon',
  //   dataIndex: 'icon',
  //   key: 'icon',
  //   width: 120,
  // },
  {
    title: 'Enable',
    dataIndex: 'enable',
    key: 'enable',
    width: 80,
    render: (v: boolean = true, row: Record<string, any>, action: Record<string, any>) => (
      <Switch checked={v} onChange={(v) => action.setRecord({ ...row, enable: v }, 'enable')} />
    ),
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 200,
    render: (v: string) => <Tag color="geekblue">{v}</Tag>
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    width: 150,
    render: (v: string[]) => (
      <span className="chat-tags">{v?.map(i => <Tag key={i}>{i}</Tag>)}</span>
    ),
  },
  {
    title: 'Action',
    fixed: 'right',
    width: 150,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'edit')}>Edit</a>
          <Popconfirm
            title="Are you sure you want to delete this URL?"
            onConfirm={() => actions.setRecord(row, 'delete')}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      )
    }
  }
];
