import { useState } from 'react';
import { clone } from 'lodash';
import { invoke } from '@tauri-apps/api';

import { CHAT_MODEL_JSON, readJSON, writeJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useChatModel(key: string, file = CHAT_MODEL_JSON) {
  const [modelJson, setModelJson] = useState<Record<string, any>>({});

  useInit(async () => {
    const data = await readJSON(file, {
      defaultVal: { name: 'ChatGPT Model', [key]: [] },
    });
    setModelJson(data);
  });

  const modelSet = async (data: Record<string, any>[]) => {
    const oData = clone(modelJson);
    oData[key] = data;
    await writeJSON(file, oData);
    await invoke('window_reload', { label: 'core' });
    setModelJson(oData);
  }

  return { modelJson, modelSet, modelData: modelJson?.[key] || [] }
}