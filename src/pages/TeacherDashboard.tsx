import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { Plus, Users, BarChart3, Settings, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type DashboardView = 'overview' | 'create-test' | 'students' | 'analytics';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [questionForm, setQuestionForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    subject: ''
  });

  const handleCreateQuestion = () => {
    if (!questionForm.text || !questionForm.subject) {
      toast({
        title: "Помилка",
        description: "Заповніть всі обов'язкові поля",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally send the question to the API
    toast({
      title: "Успіх",
      description: "Питання успішно створено",
    });

    // Reset form
    setQuestionForm({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      subject: ''
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create-test':
        return (
          <Card className="gradient-card shadow-elevated max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Створити нове питання</CardTitle>
              <CardDescription>
                Додайте питання до банку для адаптивного тестування
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Предмет *</Label>
                <Input
                  id="subject"
                  value={questionForm.subject}
                  onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                  placeholder="Наприклад: Математика"
                />
              </div>

              <div>
                <Label htmlFor="question">Текст питання *</Label>
                <Textarea
                  id="question"
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  placeholder="Введіть текст питання..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Варіанти відповідей</Label>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium w-6">{index + 1}.</span>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Варіант ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant={questionForm.correctAnswer === index ? "success" : "outline"}
                      size="sm"
                      onClick={() => setQuestionForm({ ...questionForm, correctAnswer: index })}
                    >
                      {questionForm.correctAnswer === index ? "✓" : "○"}
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-1">
                  Натисніть ✓ щоб позначити правильну відповідь
                </p>
              </div>

              <div>
                <Label htmlFor="difficulty">Складність</Label>
                <Select 
                  value={questionForm.difficulty} 
                  onValueChange={(value) => setQuestionForm({ ...questionForm, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Легко</SelectItem>
                    <SelectItem value="medium">Середньо</SelectItem>
                    <SelectItem value="hard">Складно</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateQuestion} className="w-full">
                Створити питання
              </Button>
            </CardContent>
          </Card>
        );

      case 'students':
        return (
          <Card className="gradient-card shadow-elevated">
            <CardHeader>
              <CardTitle>Студенти</CardTitle>
              <CardDescription>
                Перегляд статистики та прогресу студентів
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Список студентів та їхня статистика будуть відображені тут після інтеграції з API.
              </p>
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <Card className="gradient-card shadow-elevated">
            <CardHeader>
              <CardTitle>Аналітика</CardTitle>
              <CardDescription>
                Загальна статистика та звіти
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Детальна аналітика буде доступна після інтеграції з API.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="gradient-card shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Кабінет викладача
                </CardTitle>
                <CardDescription>
                  Вітаємо, {user?.email}! Керуйте тестами та відстежуйте прогрес студентів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Створення тестів</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Додавайте нові питання до банку тестів
                    </p>
                    <Button onClick={() => setCurrentView('create-test')} variant="default">
                      Створити питання
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="font-medium text-success mb-2">Аналітика</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Переглядайте статистику та результати студентів
                    </p>
                    <Button onClick={() => setCurrentView('analytics')} variant="success">
                      Переглянути
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('create-test')}
              >
                <CardHeader className="text-center pb-2">
                  <Plus className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Створити тест</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Додайте нові питання до банку тестів
                  </CardDescription>
                </CardContent>
              </Card>

              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('students')}
              >
                <CardHeader className="text-center pb-2">
                  <Users className="h-12 w-12 text-success mx-auto mb-2" />
                  <CardTitle className="text-lg">Студенти</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Переглянути список та прогрес студентів
                  </CardDescription>
                </CardContent>
              </Card>

              <Card 
                className="gradient-card shadow-card cursor-pointer hover:shadow-elevated transition-all"
                onClick={() => setCurrentView('analytics')}
              >
                <CardHeader className="text-center pb-2">
                  <BarChart3 className="h-12 w-12 text-warning mx-auto mb-2" />
                  <CardTitle className="text-lg">Аналітика</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Статистика та звіти по тестуванню
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