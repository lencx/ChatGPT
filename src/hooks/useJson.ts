import { useState } from 'react';

import { readJSON, writeJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useJson<T>(file: string) {
  const [json, setData] = useState<T>();

  const refreshJson = async () => {
    const data = await readJSON(file);
    setData(data);
  };

  const updateJson = async (data: any) => {
    await writeJSON(file, data);
    await refreshJson();
  };

  useInit(refreshJson);

  return { json, refreshJson, updateJson };
}
