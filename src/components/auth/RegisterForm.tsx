import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Помилка",
        description: "Паролі не співпадають",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Помилка",
        description: "Пароль повинен містити щонайменше 6 символів",
        variant: "destructive",
      });
      return;
    }

    console.log('Registering with role:', role);
    const success = await register(email, password, role);
    if (!success) {
      toast({
        title: "Помилка реєстрації",
        description: "Перевірте правильність даних або спробуйте інший email",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md gradient-card shadow-elevated">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Реєстрація</CardTitle>
        <CardDescription>
          Створіть акаунт для початку навчання
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Підтвердіть пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Роль</Label>
            <RadioGroup 
              defaultValue="student" 
              value={role} 
              onValueChange={(value) => {
                console.log('RadioGroup value changed to:', value);
                setRole(value as 'student' | 'teacher');
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="role-student" />
                <Label htmlFor="role-student" className="cursor-pointer">Студент</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="role-teacher" />
                <Label htmlFor="role-teacher" className="cursor-pointer">Викладач</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : 'Зареєструватися'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Вже є акаунт?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Увійти
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};