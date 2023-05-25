import { useState, useRef, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import { path } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import useChatPrompt, { useCachePrompt } from '@/hooks/useChatPrompt';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot, fmtDate } from '@/utils';
import { promptColumns } from './config';
import UserCustomForm from './Form';

export default function UserCustom() {
  const { rowSelection, selectedRowIDs } = useTableRowSelection();
  const [isVisible, setVisible] = useState(false);
  const [jsonPath, setJsonPath] = useState('');
  const { promptJson, promptSet } = useChatPrompt('user_custom');
  const { promptCacheJson, promptCacheSet } = useCachePrompt(jsonPath);
  const { opData, opInit, opReplaceItems, opAdd, opRemove, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(promptColumns());
  const lastUpdated = promptJson?.user_custom?.last_updated;
  const selectedItems = rowSelection.selectedRowKeys || [];
  const formRef = useRef<any>(null);

  useInit(async () => {
    setJsonPath(await path.join(await chatRoot(), 'cache_prompts', 'user_custom.json'));
  });

  useEffect(() => {
    if (promptCacheJson.length <= 0) return;
    opInit(promptCacheJson);
  }, [promptCacheJson.length]);

  useEffect(() => {
    if (!opInfo.opType) return;
    if (['edit', 'new'].includes(opInfo.opType)) {
      setVisible(true);
    }
    if (['delete'].includes(opInfo.opType)) {
      const data = opRemove(opInfo?.opRecord?.[opSafeKey]);
      promptCacheSet(data);
      opInfo.resetRecord();
    }
  }, [opInfo.opType, formRef]);

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      promptCacheSet(data);
    }
  }, [opInfo.opTime]);

  const handleEnable = (isEnable: boolean) => {
    const data = opReplaceItems(selectedRowIDs, { enable: isEnable });
    promptCacheSet(data);
  };

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  const handleOk = () => {
    formRef.current?.form?.validateFields().then(async (vals: Record<string, any>) => {
      if (
        promptCacheJson.map((i: any) => i.cmd).includes(vals.cmd) &&
        opInfo?.opRecord?.cmd !== vals.cmd
      ) {
        message.warning(
          `"cmd: /${vals.cmd}" already exists, please change the "${vals.cmd}" name and resubmit.`,
        );
        return;
      }
      let data = [];
      switch (opInfo.opType) {
        case 'new':
          data = opAdd(vals);
          break;
        case 'edit':
          data = opReplace(opInfo?.opRecord?.[opSafeKey], vals);
          break;
        default:
          break;
      }
      await promptCacheSet(data);
      opInit(data);
      promptSet({
        id: 'user_custom',
        last_updated: Date.now(),
      });
      hide();
    });
  };

  const modalTitle = `${{ new: 'Create', edit: 'Edit' }[opInfo.opType]} Prompt`;

  return (
    <div>
      <div className="chat-table-btns">
        <Button className="chat-add-btn" type="primary" onClick={opInfo.opNew}>
          Add Prompt
        </Button>
        <div>
          {selectedItems.length > 0 && (
            <>
              <Button type="primary" onClick={() => handleEnable(true)}>
                Enable
              </Button>
              <Button onClick={() => handleEnable(false)}>Disable</Button>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
      </div>
      <div className="chat-table-tip">
        <FilePath label="CACHE" paths="cache_prompts/user_custom.json" />
        {lastUpdated && (
          <span style={{ marginLeft: 10, color: '#888', fontSize: 12 }}>
            Last updated on {fmtDate(lastUpdated)}
          </span>
        )}
      </div>
      <Table
        key={lastUpdated}
        rowKey="cmd"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={opData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
        expandable={{
          expandedRowRender: (record) => <div style={{ padding: 10 }}>{record.prompt}</div>,
        }}
      />
      <Modal
        open={isVisible}
        onCancel={hide}
        title={modalTitle}
        onOk={handleOk}
        destroyOnClose
        maskClosable={false}
      >
        <UserCustomForm record={opInfo?.opRecord} ref={formRef} />
      </Modal>
    </div>
  );
}
