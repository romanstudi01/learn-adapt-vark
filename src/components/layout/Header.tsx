import { User, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-primary/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold gradient-hero bg-clip-text text-transparent">
            VARK Learning Platform
          </h1>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{user.email}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {user.role === 'student' ? 'Студент' : 'Викладач'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Вийти
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};