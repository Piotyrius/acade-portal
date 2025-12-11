import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  BookOpen,
  UserPlus,
  ClipboardCheck,
  FileCheck,
  Award,
  Clock,
  Image,
  FileText,
  DollarSign,
  CreditCard,
  Users,
  Calendar,
  Archive,
  Building2,
} from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  icon: any;
  href: string;
  keywords?: string[];
  roles?: string[];
}

const commands: CommandAction[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', keywords: ['home', 'main'] },
  { id: 'programs', label: 'Programs', icon: BookOpen, href: '/catalog/programs', keywords: ['course', 'program'], roles: ['ADMIN'] },
  { id: 'sessions', label: 'Sessions', icon: Calendar, href: '/catalog/sessions', keywords: ['class', 'schedule'], roles: ['ADMIN', 'LECTURER'] },
  { id: 'admissions', label: 'Admissions', icon: UserPlus, href: '/admissions/applications', keywords: ['application', 'enroll'], roles: ['ADMIN'] },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck, href: '/attendance/list', keywords: ['presence', 'check'], roles: ['ADMIN', 'LECTURER'] },
  { id: 'assessment', label: 'Assessment', icon: FileCheck, href: '/assessment', keywords: ['exam', 'test', 'quiz', 'grade'] },
  { id: 'certificates', label: 'Certificates', icon: Award, href: '/certificates/list', keywords: ['cert', 'diploma'] },
  { id: 'timekeeping', label: 'Timekeeping', icon: Clock, href: '/timekeeping', keywords: ['hours', 'timesheet', 'worklog'], roles: ['ADMIN', 'LECTURER'] },
  { id: 'gallery', label: 'Gallery', icon: Image, href: '/gallery/mine', keywords: ['portfolio', 'works'] },
  { id: 'documents', label: 'Documents', icon: FileText, href: '/documents', keywords: ['files', 'docs'] },
  { id: 'reporting', label: 'Reporting', icon: FileText, href: '/reporting', keywords: ['reports', 'analytics', 'export'], roles: ['ADMIN'] },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/payments', keywords: ['invoice', 'payment', 'billing'], roles: ['ADMIN'] },
  { id: 'users', label: 'Users', icon: Users, href: '/users', keywords: ['people', 'students', 'lecturers'], roles: ['ADMIN'] },
  { id: 'archive', label: 'Archive', icon: Archive, href: '/archive', keywords: ['old', 'deleted'], roles: ['ADMIN'] },
  { id: 'subscriptions', label: 'Subscriptions', icon: Building2, href: '/subscriptions/subscriptions', keywords: ['subscription', 'plan'], roles: ['ADMIN'] },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const filteredCommands = commands.filter((cmd) => {
    if (cmd.roles && user?.role) {
      return cmd.roles.includes(user.role);
    }
    return true;
  });

  const handleSelect = (href: string) => {
    navigate(href);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={`${cmd.label} ${cmd.keywords?.join(' ') || ''}`}
                onSelect={() => handleSelect(cmd.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to use command palette with keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}

