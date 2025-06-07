import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { KEYBOARD_SHORTCUTS } from '../constants';

export const useKeyboardShortcuts = () => {
  const { setCommandPaletteOpen, setTheme, theme } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, metaKey, ctrlKey, shiftKey } = event;
      const cmdKey = metaKey || ctrlKey;

      // Command Palette
      if (cmdKey && key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Toggle Theme
      if (cmdKey && shiftKey && key === 'T') {
        event.preventDefault();
        setTheme(theme === 'light' ? 'dark' : 'light');
      }

      // Search
      if (cmdKey && key === '/') {
        event.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Escape
      if (key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, setTheme, theme]);
};