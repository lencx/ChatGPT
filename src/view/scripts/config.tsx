import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Space, Popconfirm } from 'antd';
import { path, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import { fmtDate, chatRoot } from '@/utils';

export const scriptColumns = () => [
  {
    title: 'File Name',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    render: (v: string) => <Tag>{v}</Tag>,
  },
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    width: 120,
    render: (v: string) => <Tag>{v}</Tag>,
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
    width: 160,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <Link to={`/md/${row.id}`} state={row}>
            Edit
          </Link>
          <Popconfirm
            title="Are you sure you want to synchronize? It will overwrite all previous modifications made to this file."
            onConfirm={() => actions.setRecord(row, 'sync')}
            okText="Yes"
            cancelText="No"
          >
            <a>Sync</a>
          </Popconfirm>
        </Space>
      );
    },
  },
];

const RenderPath = ({ row }: any) => {
  const [filePath, setFilePath] = useState('');
  useInit(async () => {
    setFilePath(await getPath(row));
  });
  return <a onClick={() => shell.open(filePath)}>{filePath}</a>;
};

export const getPath = async (row: any) => {
  return (await path.join(await chatRoot(), 'notes', row.id)) + `.${row.ext}`;
};
