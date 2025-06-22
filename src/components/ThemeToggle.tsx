
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTheme } from './ThemeProvider';
import { Shield } from 'lucide-react'; // Using allowed icon

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Shield className={`h-4 w-4 transition-transform ${theme === 'dark' ? 'rotate-180' : ''}`} />
    </Button>
  );
};
