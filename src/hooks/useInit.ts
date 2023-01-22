import { useRef, useEffect } from 'react';

// fix: Two interface requests will be made in development mode
export default function useInit(callback: () => void) {
  const isInit = useRef(true);
  useEffect(() => {
    if (isInit.current) {
      callback();
      isInit.current = false;
    }
  });
}
