import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Esc'], description: 'Close dialog/modal', category: 'General' },
  { keys: ['⌘', 'Enter'], description: 'Submit form', category: 'Forms' },
  { keys: ['⌘', 'S'], description: 'Save (if applicable)', category: 'General' },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const shortcutsByCategory = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold mb-2">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shortcut</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryShortcuts.map((shortcut, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <kbd
                              key={i}
                              className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{shortcut.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to use keyboard shortcuts
export function useKeyboardShortcuts() {
  return { KeyboardShortcuts };
}

