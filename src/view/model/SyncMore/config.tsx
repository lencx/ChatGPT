import { useState } from 'react';
import { Tag, Space, Popconfirm } from 'antd';
import { shell, path } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import { chatRoot, fmtDate } from '@/utils';

export const pathColumns = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 100,
  },
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 80,
    render: (v: string) => <Tag>{v}</Tag>,
  },
  {
    title: 'PATH',
    dataIndex: 'path',
    key: 'path',
    width: 180,
    render: (_: string, row: any) => <RenderPath row={row} />
  },
  {
    title: 'Last updated',
    dataIndex: 'last_updated',
    key: 'last_updated',
    width: 140,
    render: fmtDate,
  },
  {
    title: 'Action',
    fixed: 'right',
    width: 140,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'sync')}>Sync</a>
          <a onClick={() => actions.setRecord(row, 'edit')}>Edit</a>
          <Popconfirm
            title="Are you sure to delete this path?"
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

const RenderPath = ({ row }: any) => {
  const [filePath, setFilePath] = useState('');
  useInit(async () => {
      setFilePath(await getPath(row));
  })
  return <a onClick={() => shell.open(filePath)}>{filePath}</a>
};

export const getPath = async (row: any) => {
  if (!/^http/.test(row.protocol)) {
    return await path.join(await chatRoot(), row.path) + `.${row.ext}`;
  } else {
    return `${row.protocol}://${row.path}.${row.ext}`;
  }
}