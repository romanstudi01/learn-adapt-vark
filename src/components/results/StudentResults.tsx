import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { testAPI, varkAPI } from '@/services/api';
import { Brain, Target, Award, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const StudentResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [varkResult, setVarkResult] = useState<any>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const [testResults, varkResults] = await Promise.all([
        testAPI.getResults(),
        varkAPI.getUserResult()
      ]);

      if (testResults.success && testResults.data) {
        setResults(testResults.data);
      }

      if (varkResults.success && varkResults.data) {
        setVarkResult(varkResults.data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Завантаження результатів..." />
        </CardContent>
      </Card>
    );
  }

  const getVarkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      visual: 'Візуальний',
      auditory: 'Аудіальний',
      read_write: 'Читання/Письмо',
      kinesthetic: 'Кінестетичний'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">VARK Тип</p>
              <p className="text-lg font-bold">
                {varkResult?.vark_type ? getVarkTypeLabel(varkResult.vark_type) : 'Не визначено'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Target className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Тестів пройдено</p>
              <p className="text-2xl font-bold">{results?.tests_completed || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-8 w-8 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Середній бал</p>
              <p className="text-2xl font-bold">{results?.average_score || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Правильних відповідей</p>
              <p className="text-2xl font-bold">{results?.correct_answers || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VARK Results */}
      {varkResult && (
        <Card className="gradient-card shadow-elevated">
          <CardHeader>
            <CardTitle>Результати VARK тесту</CardTitle>
            <CardDescription>
              Ваш домінуючий стиль навчання: {getVarkTypeLabel(varkResult.vark_type)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(varkResult)
                .filter(([key]) => ['visual', 'auditory', 'read_write', 'kinesthetic'].includes(key))
                .map(([type, value]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{getVarkTypeLabel(type)}</span>
                      <span className="text-sm font-medium">{String(value)}%</span>
                    </div>
                    <Progress value={Number(value)} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {results?.test_history && results.test_history.length > 0 && (
        <Card className="gradient-card shadow-elevated">
          <CardHeader>
            <CardTitle>Історія тестування</CardTitle>
            <CardDescription>
              Ваші останні результати тестів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.test_history.map((test: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-accent/50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{test.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(test.completed_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{test.score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {test.questions_answered} питань
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!results && !varkResult && (
        <Card className="gradient-card shadow-elevated">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              У вас поки немає результатів. Пройдіть тести, щоб побачити вашу статистику.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
