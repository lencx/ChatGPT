import { useState } from 'react';
import { Table, Tag } from 'antd';

import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { scriptColumns } from './config';
import ScriptHead, { type ScriptInfo } from './Head';
import ScriptEditor from './Editor';
import './index.scss';

// const { Panel } = Collapse;

const SCRIPTS = [
  'core.js',
  'chat.js',
  'cmd.js',
  'dalle2.js',
  'export.js',
  'markdown.export.js',
  'popup.core.js',
];

export default function Scripts() {
  const [activeKey, setActiveKey] = useState('core.js');

  const { columns, ...opInfo } = useColumns(scriptColumns());

  const handleActiveKeyChange = (key: any) => {
    setActiveKey(key);
  };

  const panelHeadProps = {
    onEdit(data: ScriptInfo) {
      setActiveKey(data.name);
    },
    activeKey,
  };

  return (
    <div className="chatgpt-script">
      <Table
        columns={columns}
        dataSource={SCRIPTS.map((i) => ({ name: i }))}
        {...TABLE_PAGINATION}
      />
      {/* <Tabs
        items={SCRIPTS.map((i) => {
          return {
            label: <Tag>{i}</Tag>,
            key: i,
            children: <ScriptEditor />,
          }
        })}
      /> */}
      {/* <Collapse
        accordion
        collapsible="icon"
        activeKey={activeKey}
        onChange={handleActiveKeyChange}
      >
        {SCRIPTS.map((i) => {
          return (
            <Panel header={<ScriptHead name={i} {...panelHeadProps} />} key={i}>
              <ScriptEditor />
            </Panel>
          )
        })}
      </Collapse> */}
    </div>
  );
}
