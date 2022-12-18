import { useState } from 'react';
import { clone } from 'lodash';

import { CHAT_MODEL_JSON, readJSON, writeJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useChatModel(key: string) {
  const [modelJson, setModelJson] = useState<Record<string, any>>({});

  useInit(async () => {
    const data = await readJSON(CHAT_MODEL_JSON, { name: 'ChatGPT Model', [key]: [] });
    setModelJson(data);
  });

  const modelSet = async (data: Record<string, any>[]) => {
    const oData = clone(modelJson);
    oData[key] = data;
    await writeJSON(CHAT_MODEL_JSON, oData);
    setModelJson(oData);
  }

  return { modelJson, modelSet, modelData: modelJson?.[key] || [] }
}