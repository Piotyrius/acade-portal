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
import { useTranslation } from 'react-i18next';

interface Shortcut {
  keys: string[];
  descriptionKey: string;
  categoryKey: string;
}

const getShortcuts = (t: (key: string) => string): Shortcut[] => [
  { keys: ['⌘', 'K'], descriptionKey: 'layout.keyboardShortcutsOpenCommandPalette', categoryKey: 'layout.keyboardShortcutsCategoryNavigation' },
  { keys: ['⌘', '/'], descriptionKey: 'layout.keyboardShortcutsShowShortcuts', categoryKey: 'layout.keyboardShortcutsCategoryNavigation' },
  { keys: ['⌘', 'B'], descriptionKey: 'layout.keyboardShortcutsToggleSidebar', categoryKey: 'layout.keyboardShortcutsCategoryNavigation' },
  { keys: ['Esc'], descriptionKey: 'layout.keyboardShortcutsCloseDialog', categoryKey: 'layout.keyboardShortcutsCategoryGeneral' },
  { keys: ['⌘', 'Enter'], descriptionKey: 'layout.keyboardShortcutsSubmitForm', categoryKey: 'layout.keyboardShortcutsCategoryForms' },
  { keys: ['⌘', 'S'], descriptionKey: 'layout.keyboardShortcutsSave', categoryKey: 'layout.keyboardShortcutsCategoryGeneral' },
];

export function KeyboardShortcuts() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const shortcuts = getShortcuts(t);

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
    const category = t(shortcut.categoryKey);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('layout.keyboardShortcutsTitle')}</DialogTitle>
          <DialogDescription>
            {t('layout.keyboardShortcutsDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold mb-2">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('layout.keyboardShortcutsTableShortcut')}</TableHead>
                    <TableHead>{t('layout.keyboardShortcutsTableDescription')}</TableHead>
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
                      <TableCell>{t(shortcut.descriptionKey)}</TableCell>
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




