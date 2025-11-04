import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VarkTest } from '@/components/vark/VarkTest';
import { VarkResults } from '@/components/vark/VarkResults';
import { AdaptiveTest } from '@/components/test/AdaptiveTest';
import { StudentResults } from '@/components/results/StudentResults';
import { useAuth } from '@/context/AuthContext';
import { varkAPI } from '@/services/api';
import { Brain, Target, BarChart3, User } from 'lucide-react';

type DashboardView = 'overview' | 'vark-test' | 'vark-results' | 'adaptive-test' | 'results';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [varkResults, setVarkResults] = useState<any>(null);
  const [hasExistingVarkResult, setHasExistingVarkResult] = useState(false);

  useEffect(() => {
    checkExistingVarkResult();
  }, []);

  const checkExistingVarkResult = async () => {
    try {
      const result = await varkAPI.getUserResult();
      if (result.success && result.data) {
        setVarkResults(result.data);
        setHasExistingVarkResult(true);
      }
    } catch (error) {
      console.error('Failed to check VARK result:', error);
    }
  };

  const handleVarkComplete = (results: any) => {
    setVarkResults(results);
    setCurrentView('vark-results');
  };

  const handleStartAdaptiveTest = () => {
    setCurrentView('adaptive-test');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'vark-test':
        return <VarkTest onComplete={handleVarkComplete} hasExistingResult={hasExistingVarkResult} />;
      case 'vark-results':
        return varkResults ? (
          <VarkResults 
            results={varkResults} 
            onStartAdaptiveTest={handleStartAdaptiveTest}
          />
        ) : null;
      case 'adaptive-test':
        return <AdaptiveTest />;
      case 'results':
        return <StudentResults />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Вітаємо, {user?.email}!
                </CardTitle>
                <CardDescription>
                  Ваш особистий кабінет для проходження тестів та відстеження прогресу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">VARK Тест</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasExistingVarkResult 
                        ? `Ваш тип: ${varkResults?.vark_type || 'визначається'}`
                        : 'Визначте свій стиль навчання за методикою VARK'}
                    </p>
                    <Button onClick={() => setCurrentView(hasExistingVarkResult ? 'vark-results' : 'vark-test')} variant="default">
                      {hasExistingVarkResult ? 'Переглянути результати' : 'Пройти тест'}
                    </Button>
                    {hasExistingVarkResult && (
                      <Button 
                        onClick={() => setCurrentView('vark-test')} 
                        variant="outline" 
                        className="mt-2 w-full"
                      >
                        Пройти тест повторно
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="font-medium text-success mb-2">Адаптивне тестування</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Тести, що адаптуються до вашого рівня знань
                    </p>
                    <Button onClick={() => setCurrentView('adaptive-test')} variant="success">
                      Розпочати
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('vark-test')}
              >
                <CardHeader className="text-center pb-2">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">VARK Тест</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Дізнайтеся свій домінуючий стиль навчання
                  </CardDescription>
                </CardContent>
              </Card>

              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('adaptive-test')}
              >
                <CardHeader className="text-center pb-2">
                  <Target className="h-12 w-12 text-success mx-auto mb-2" />
                  <CardTitle className="text-lg">Адаптивний тест</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Персоналізоване тестування знань
                  </CardDescription>
                </CardContent>
              </Card>

              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('results')}
              >
                <CardHeader className="text-center pb-2">
                  <BarChart3 className="h-12 w-12 text-warning mx-auto mb-2" />
                  <CardTitle className="text-lg">Мої результати</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Переглянути статистику та прогрес
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      {currentView !== 'overview' && (
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('overview')}
            className="mb-4"
          >
            ← Повернутися до головної
          </Button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};