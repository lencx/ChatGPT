import { Switch, Tag, Tooltip, Space, Popconfirm } from 'antd';

export const syncColumns = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    fixed: 'left',
    // width: 120,
    key: 'name',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: () => {
      return <Tag>{}</Tag>;
    }
    // width: 200,
  },
  {
    title: 'Action',
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a>View</a>
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