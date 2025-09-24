import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { BookOpen, Brain, Target, Users } from 'lucide-react';

export const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (showLogin) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <LoginForm onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }} />
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <RegisterForm onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            VARK Learning Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Персоналізована платформа для визначення вашого стилю навчання та адаптивного тестування
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="glass"
              size="lg" 
              onClick={() => setShowLogin(true)}
            >
              Увійти
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => setShowRegister(true)}
            >
              Зареєструватися
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Можливості платформи</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="gradient-card shadow-card">
              <CardHeader className="text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>VARK Тест</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Визначте свій домінуючий стиль навчання: візуальний, аудіальний, читання/письмо або кінестетичний
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Адаптивне тестування</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Персоналізовані тести, що адаптуються до вашого рівня знань та стилю навчання
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle>Для викладачів</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Створюйте тести, відстежуйте прогрес студентів та аналізуйте результати навчання
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="gradient-card shadow-card">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Для студентів</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Проходьте тести, отримуйте персоналізовані рекомендації та відстежуйте свій прогрес
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Розпочніть своє персоналізоване навчання вже сьогодні
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Приєднуйтесь до тисяч студентів та викладачів, які вже використовують нашу платформу
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => setShowRegister(true)}
          >
            Почати безкоштовно
          </Button>
        </div>
      </section>
    </div>
  );
};