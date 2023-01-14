import { useState } from 'react';
import { Tag, Space, Popconfirm } from 'antd';
import { path, shell } from '@tauri-apps/api';

import { EditRow } from '@/hooks/useColumns';

import useInit from '@/hooks/useInit';
import { fmtDate, chatRoot } from '@/utils';

const colorMap: any = {
  pdf: 'blue',
  png: 'orange',
}

export const downloadColumns = () => [
  {
    title: 'Name',
    dataIndex: 'name',
    fixed: 'left',
    key: 'name',
    width: 240,
    render: (_: string, row: any, actions: any) => (
      <EditRow rowKey="name" row={row} actions={actions} />
    ),
  },
  {
    title: 'Extension',
    dataIndex: 'ext',
    key: 'ext',
    width: 120,
    render: (v: string) => <Tag color={colorMap[v]}>{v}</Tag>,
  },
  {
    title: 'Path',
    dataIndex: 'path',
    key: 'path',
    width: 200,
    render: (_: string, row: any) => <RenderPath row={row} />,
  },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
    width: 150,
    render: fmtDate,
  },
  {
    title: 'Action',
    fixed: 'right',
    width: 150,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'preview')}>Preview</a>
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

const RenderPath = ({ row }: any) => {
  const [filePath, setFilePath] = useState('');
  useInit(async () => {
      setFilePath(await getPath(row));
  })
  return <a onClick={() => shell.open(filePath)}>{filePath}</a>;
};

export const getPath = async (row: any) => {
  const isImg = ['png'].includes(row?.ext);
  return await path.join(await chatRoot(), 'download', isImg ? 'img' : row.ext, row.id) + `.${row.ext}`;
}
