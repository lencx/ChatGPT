import { useState } from 'react';

import { readJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useJson<T>(file: string) {
  const [json, setData] = useState<T>();

  const refreshJson = async () => {
    const data = await readJSON(file);
    setData(data);
  };

  useInit(refreshJson);

  return { json, refreshJson };
}
