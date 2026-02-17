import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, FileText } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/endpoints/auth';
import { getCohorts } from '@/api/endpoints/catalog';
import { getEnrollments, getApplications } from '@/api/endpoints/admissions';
import { useAuthStore } from '@/store/authStore';
import { Users, BookOpen, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function GlobalSearch() {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search across multiple entities - debounce the query
  const { data: users = [] } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: () => getUsers(),
    enabled: searchQuery.length >= 2, // Only search when at least 2 characters
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: cohorts = [] } = useQuery({
    queryKey: ['search-cohorts', searchQuery],
    queryFn: () => getCohorts(),
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['search-enrollments', searchQuery],
    queryFn: () => getEnrollments(),
    enabled: searchQuery.length >= 2 && user?.role === 'ADMIN',
    staleTime: 30000,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['search-applications', searchQuery],
    queryFn: () => getApplications(),
    enabled: searchQuery.length >= 2 && user?.role === 'ADMIN',
    staleTime: 30000,
  });

  // Filter results based on search query
  const filteredUsers = users.filter((u: any) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(query) ||
      u.last_name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query)
    );
  }).slice(0, 5);

  const filteredCohorts = cohorts.filter((c: any) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(query);
  }).slice(0, 5);

  const filteredEnrollments = enrollments.filter((e: any) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      e.student_name?.toLowerCase().includes(query) ||
      e.cohort_name?.toLowerCase().includes(query)
    );
  }).slice(0, 5);

  const filteredApplications = applications.filter((app: any) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      app.name?.toLowerCase().includes(query) ||
      app.email?.toLowerCase().includes(query)
    );
  }).slice(0, 5);

  const hasResults = filteredUsers.length > 0 || filteredCohorts.length > 0 || filteredEnrollments.length > 0 || filteredApplications.length > 0;

  const handleSelect = (href: string) => {
    navigate(href);
    setSearchQuery('');
    setOpen(false);
  };

  return (
    <Popover open={open && hasResults} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative hidden md:flex w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={t('layout.globalSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpen(e.target.value.length > 0);
            }}
            onFocus={() => {
              if (searchQuery.length > 0) {
                setOpen(true);
              }
            }}
            className="pl-9 pr-4 h-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto">
          {filteredUsers.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t('layout.globalSearchUsers')}</div>
              {filteredUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(`/users`)}
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {u.first_name} {u.last_name} ({u.email})
                  </span>
                </div>
              ))}
            </div>
          )}

          {filteredCohorts.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t('layout.globalSearchCohorts')}</div>
              {filteredCohorts.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(`/catalog/sessions`)}
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{c.name}</span>
                </div>
              ))}
            </div>
          )}

          {user?.role === 'ADMIN' && filteredEnrollments.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t('layout.globalSearchEnrollments')}</div>
              {filteredEnrollments.map((e: any) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(`/admissions/enrollments`)}
                >
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {e.student_name} - {e.cohort_name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {user?.role === 'ADMIN' && filteredApplications.length > 0 && (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{t('layout.globalSearchApplications')}</div>
              {filteredApplications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSelect(`/admissions/applications`)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {app.name} ({app.email})
                  </span>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length > 0 && !hasResults && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t('layout.globalSearchNoResults')}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

