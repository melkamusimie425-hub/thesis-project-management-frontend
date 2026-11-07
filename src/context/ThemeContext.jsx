import { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [accentHue, setAccentHue] = useState(142);   // WSU green
  const [dark,      setDark]      = useState(true);

  const value = useMemo(
    () => ({ accentHue, setAccentHue, dark, setDark }),
    [accentHue, dark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
