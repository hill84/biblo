import { useCallback, useState } from 'react';

const useToggle = (initialValue: boolean) => {
  const [value, setValue] = useState<boolean>(initialValue);
  const toggle = useCallback((): void => setValue(v => !v), []);
  return [value, toggle] as const;
};

export default useToggle;