import { FC, useState, useCallback } from 'react';
import { Input } from 'antd';

import { DISABLE_AUTO_COMPLETE } from '@/utils';

export default function useColumns(columns: any[] = []) {
  const [opType, setOpType] = useState('');
  const [opRecord, setRecord] = useState<Record<string | symbol, any> | null>(null);
  const [opTime, setNow] = useState<number | null>(null);
  const [opExtra, setExtra] = useState<any>(null);

  const handleRecord = useCallback((row: Record<string, any> | null, type: string) => {
    setOpType(type);
    setRecord(row);
    setNow(Date.now());
  }, []);

  const resetRecord = useCallback(() => {
    setRecord(null);
    setOpType('');
    setNow(Date.now());
  }, []);

  const opNew = useCallback(() => handleRecord(null, 'new'), [handleRecord]);

  const cols = columns.map((i: any) => {
    if (i.render) {
      const opRender = i.render;
      i.render = (text: string, row: Record<string, any>) => {
        return opRender(text, row, { setRecord: handleRecord, setExtra });
      };
    }
    return i;
  });

  return {
    opTime,
    opType,
    opNew,
    columns: cols,
    opRecord,
    setRecord: handleRecord,
    resetRecord,
    setExtra,
    opExtra,
  };
}

interface EditRowProps {
  rowKey: string;
  row: Record<string, any>;
  actions: any;
}
export const EditRow: FC<EditRowProps> = ({ rowKey, row, actions }) => {
  const [isEdit, setEdit] = useState(false);
  const [val, setVal] = useState(row[rowKey] || '');
  const handleEdit = () => {
    setEdit(true);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
  };

  const handleSave = () => {
    setEdit(false);
    row[rowKey] = val?.trim();
    actions?.setRecord(row, 'rowedit');
  };

  return isEdit ? (
    <Input
      value={val}
      autoFocus
      onChange={handleChange}
      {...DISABLE_AUTO_COMPLETE}
      onPressEnter={handleSave}
    />
  ) : (
    <div className="rowedit" onClick={handleEdit}>
      {val}
    </div>
  );
};
