import { useState, useEffect } from 'react';
import { v4 } from 'uuid';

const safeKey = Symbol('chat-id');

export default function useData(oData: any[]) {
  const [opData, setData] = useState<any[]>([]);

  useEffect(() => {
    opInit(oData);
  }, [])

  const opAdd = (val: any) => {
    const v = [val, ...opData];
    setData(v);
    return v;
  };

  const opInit = (val: any[] = []) => {
    const nData = val.map(i => ({ [safeKey]: v4(), ...i }));
    setData(nData);
  };

  const opRemove = (id: string) => {
    const nData = opData.filter(i => i[safeKey] !== id);
    setData(nData);
    return nData;
  };

  const opReplace = (id: string, data: any) => {
    const nData = [...opData];
    const idx = opData.findIndex(v => v[safeKey] === id);
    nData[idx] = data;
    setData(nData);
    return nData;
  };

  return { opSafeKey: safeKey, opInit, opReplace, opAdd, opRemove, opData };
}