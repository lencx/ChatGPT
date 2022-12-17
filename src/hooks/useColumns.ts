import { useState, useCallback } from 'react';

export default function useColumns(columns: any[] = []) {
  const [opType, setOpType] = useState('');
  const [opRecord, setRecord] = useState<Record<string|symbol, any> | null>(null);
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