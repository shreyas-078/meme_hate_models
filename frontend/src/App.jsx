import React from 'react';
import { AppProviders } from './contexts/AppProviders';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyboardShortcut } from './hooks/useKeyboard';
import { useTheme } from './contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <KeyboardShortcuts />
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}

// Global keyboard shortcuts
function KeyboardShortcuts() {
  const { toggleTheme } = useTheme();

  // Ctrl/Cmd + K to toggle theme
  useKeyboardShortcut({ key: 'k', ctrl: true }, () => {
    toggleTheme();
  });

  // Ctrl/Cmd + / for help (could show a help modal)
  useKeyboardShortcut({ key: '/', ctrl: true }, () => {
    console.log('Help shortcut triggered');
  });

  return null;
}

export default App;
