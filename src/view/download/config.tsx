import { Tag, Space, Popconfirm } from 'antd';

import { fmtDate } from '@/utils';

const colorMap: any = {
  pdf: 'blue',
  png: 'orange',
}

export const syncColumns = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    fixed: 'left',
    key: 'name',
  },
  {
    title: 'Extension',
    dataIndex: 'ext',
    key: 'ext',
    render: (v: string) => <Tag color={colorMap[v]}>{v}</Tag>,
  },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
    render: fmtDate,
  },
  {
    title: 'Action',
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'view')}>View</a>
          <Popconfirm
            title="Are you sure to delete this file?"
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

// {
//   id: '',
//   name: '',
//   type: '.png',
//   created: '2022.01.01',
// }