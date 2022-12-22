import { Table, Button } from 'antd';

import { TABLE_PAGINATION } from '@/hooks/useTable';
import './index.scss';

export default function SyncMore() {
  return (
    <div>
      <Button className="add-btn" type="primary">Add URL</Button>
      <Table
        key="id"
        rowKey="url"
        columns={[]}
        scroll={{ x: 'auto' }}
        dataSource={[]}
        pagination={TABLE_PAGINATION}
      />
    </div>
  )
}