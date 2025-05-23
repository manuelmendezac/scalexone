import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Mode = 'default' | 'focus' | 'sleep' | 'productivity';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  toggleTheme: () => void;
  setMode: (mode: Mode) => void;
  handleVoiceCommand: (command: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_COMMANDS = {
  'modo normal': 'default',
  'modo enfoque': 'focus',
  'modo descanso': 'sleep',
  'modo productividad': 'productivity',
  'modo sueño': 'sleep',
  'modo trabajo': 'productivity',
  'modo concentración': 'focus',
} as const;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'dark';
  });

  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('mode') as Mode) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mode', mode);
    document.documentElement.classList.remove('mode-default', 'mode-focus', 'mode-sleep', 'mode-productivity');
    document.documentElement.classList.add(`mode-${mode}`);

    // Aplicar efectos visuales específicos del modo
    const body = document.body;
    body.classList.remove('mode-focus-effects', 'mode-sleep-effects', 'mode-productivity-effects');
    
    switch (mode) {
      case 'focus':
        body.classList.add('mode-focus-effects');
        break;
      case 'sleep':
        body.classList.add('mode-sleep-effects');
        break;
      case 'productivity':
        body.classList.add('mode-productivity-effects');
        break;
    }
  }, [mode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleVoiceCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    const newMode = MODE_COMMANDS[normalizedCommand as keyof typeof MODE_COMMANDS];
    
    if (newMode) {
      setMode(newMode);
      return true;
    }
    return false;
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode, handleVoiceCommand }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 