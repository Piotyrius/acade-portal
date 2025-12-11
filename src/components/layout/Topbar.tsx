import { useAuthStore } from '@/store/authStore';
import { logout } from '@/api/endpoints/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Moon, Sun, Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { LuMenu } from "react-icons/lu";
import { CommandPalette, useCommandPalette } from '@/components/search/CommandPalette';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';


export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();


const handleLogout = async () => {
  try {
    if (refreshToken) {
      await logout(refreshToken);
    }
  } catch (err) {
    console.log('Error')
  }

  clearAuth();
  navigate('/login');
};


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || 'U'
    : 'U';


  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-card-foreground topbar_welcome">
          Welcome back, {user?.firstName}!
        </h1>
        <Badge variant="secondary" className='topbar_user_role'>{user?.role}</Badge>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end max-w-md">
        <GlobalSearch />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCommandOpen(true)}
          className="hidden md:flex"
          title="Open command palette (Cmd+K)"
        >
          <Search className="h-5 w-5" />
        </Button>
        <NotificationCenter />
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        <LuMenu className='menu_icon' onClick={onMenuClick} />


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </header>
  );
}
