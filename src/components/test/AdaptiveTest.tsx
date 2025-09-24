import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { testAPI } from '@/services/api';
import { Question, TestSession } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Clock, Target, TrendingUp } from 'lucide-react';

// Mock questions for demo
const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Яке значення має вираз 2 + 3 × 4?',
    options: ['14', '20', '10', '24'],
    correct_answer: 0,
    difficulty: 'medium',
    subject: 'mathematics'
  },
  {
    id: '2',
    text: 'Хто написав роман "Кобзар"?',
    options: ['Іван Франко', 'Тарас Шевченко', 'Леся Українка', 'Михайло Коцюбинський'],
    correct_answer: 1,
    difficulty: 'easy',
    subject: 'literature'
  }
];

export const AdaptiveTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    loadNextQuestion();
  }, []);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    try {
      const result = await testAPI.getNextQuestion(session?.id);
      if (result.success && result.data) {
        setCurrentQuestion(result.data.question);
        setSession(result.data.session);
      } else {
        // Use mock data for demo
        const randomQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
        setCurrentQuestion(randomQuestion);
        setSession({
          id: 'demo-session',
          user_id: 'demo-user',
          score: correctAnswers,
          questions_answered: questionsAnswered,
          difficulty_level: 1,
          is_completed: false
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити питання",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStartTime(Date.now());
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion) return;

    setIsSubmitting(true);
    const timeSpent = Date.now() - startTime;
    const isCorrect = selectedOption === currentQuestion.correct_answer;

    try {
      await testAPI.submitAnswer({
        user_id: 'demo-user',
        question_id: currentQuestion.id,
        answer: selectedOption,
        time_spent: timeSpent,
        is_correct: isCorrect
      });

      setQuestionsAnswered(prev => prev + 1);
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        toast({
          title: "Правильно!",
          description: "Ви дали правильну відповідь",
          variant: "default",
        });
      } else {
        toast({
          title: "Неправильно",
          description: `Правильна відповідь: ${currentQuestion.options[currentQuestion.correct_answer]}`,
          variant: "destructive",
        });
      }

      // Load next question after a short delay
      setTimeout(() => {
        setSelectedOption(null);
        loadNextQuestion();
      }, 2000);

    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося відправити відповідь",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'hard':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Легко';
      case 'medium':
        return 'Середньо';
      case 'hard':
        return 'Складно';
      default:
        return difficulty;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Завантаження питання..." />
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Не вдалося завантажити питання</p>
        </CardContent>
      </Card>
    );
  }

  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Точність</p>
              <p className="text-2xl font-bold">{accuracy}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Правильних відповідей</p>
              <p className="text-2xl font-bold">{correctAnswers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Всього питань</p>
              <p className="text-2xl font-bold">{questionsAnswered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question */}
      <Card className="w-full max-w-2xl mx-auto gradient-card shadow-elevated">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>Адаптивне тестування</CardTitle>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </Badge>
          </div>
          <CardDescription>
            Предмет: {currentQuestion.subject}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
            
            <RadioGroup 
              value={selectedOption?.toString()} 
              onValueChange={(value) => setSelectedOption(parseInt(value))}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Відправити відповідь'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};