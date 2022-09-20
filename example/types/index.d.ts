declare const THEMEVARS: {
  light: { [key: string]: string };
  dark: { [key: string]: string };
};

declare const changeGlobalTheme: (isDark: boolean) => void;
