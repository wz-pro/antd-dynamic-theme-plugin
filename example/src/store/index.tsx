import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface IColorContext {
  isDark: boolean;
  changeTheme: () => void;
  useColor: (name: string[]) => string[];
}

const ColorContext = createContext<IColorContext>({
  isDark: true,
  changeTheme: () => undefined,
  useColor: () => [],
});

interface ProviderProps {
  children: ReactNode;
}

function Provider({ children }: ProviderProps) {
  const [isDark, setIsDark] = useState(true);

  const changeTheme = useCallback(() => {
    setIsDark((prevState) => {
      changeGlobalTheme(!prevState);
      return !prevState;
    });
  }, []);

  const useColor = useCallback(
    (name: string[]) => {
      const data = THEMEVARS[isDark ? 'dark' : 'light'];
      return name.map((key: string) => data[key]);
    },
    [isDark],
  );

  return (
    <ColorContext.Provider value={{ isDark, useColor, changeTheme }}>
      {children}
    </ColorContext.Provider>
  );
}

function useTheme() {
  const { changeTheme, isDark } = useContext(ColorContext);
  return { isDark, changeTheme };
}

function useColor(name: string[]) {
  const { useColor } = useContext(ColorContext);
  return useColor(name);
}

export { Provider, useColor, useTheme };
