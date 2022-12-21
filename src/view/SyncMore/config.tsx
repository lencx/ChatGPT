// import { Switch, Tag, Tooltip } from 'antd';

export const genCmd = (act: string) => act.replace(/\s+|\/+/g, '_').replace(/[^\d\w]/g, '').toLocaleLowerCase();

export const recordColumns = () => [
  {
    title: 'URL',
    dataIndex: 'url',
    // fixed: 'left',
    // width: 120,
    key: 'url',
  },
  {
    title: 'File Type',
    dataIndex: 'file_type',
    key: 'file_type',
    // width: 200,
  },
  {
    title: 'Action',
  }
];
