import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { SubjectSelector } from './SubjectSelector';
import { testAPI } from '@/services/api';
import { Question } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Clock, Target, TrendingUp } from 'lucide-react';

export const AdaptiveTest = () => {
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentSubjectName, setCurrentSubjectName] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubjectSelect = async (subjectId: string, subjectName: string) => {
    setCurrentSubject(subjectId);
    setCurrentSubjectName(subjectName);
    setIsLoading(true);

    try {
      const result = await testAPI.startTest(subjectId);
      if (result.success && result.data) {
        setSessionId(result.data.session_id);
        setCurrentQuestion(result.data.question);
        setStartTime(Date.now());
      } else {
        toast({
          title: "Помилка",
          description: result.error || "Не вдалося розпочати тест",
          variant: "destructive",
        });
        setCurrentSubject(null);
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося розпочати тест",
        variant: "destructive",
      });
      setCurrentSubject(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQuestion || !sessionId) return;

    setIsSubmitting(true);
    const timeSpent = Date.now() - startTime;

    try {
      const result = await testAPI.submitAnswer(
        sessionId,
        currentQuestion.id,
        selectedOption,
        timeSpent
      );

      if (result.success && result.data) {
        const isCorrect = result.data.is_correct;
        
        setQuestionsAnswered(prev => prev + 1);
        if (isCorrect) {
          setCorrectAnswers(prev => prev + 1);
          toast({
            title: "Правильно!",
            description: "Ви дали правильну відповідь",
          });
        } else {
          toast({
            title: "Неправильно",
            description: `Правильна відповідь: ${currentQuestion.options[currentQuestion.correct_answer]}`,
            variant: "destructive",
          });
        }

        // Check if test is completed
        if (result.data.completed) {
          setIsCompleted(true);
          toast({
            title: "Тест завершено!",
            description: `Ви відповіли правильно на ${correctAnswers + (isCorrect ? 1 : 0)} з ${questionsAnswered + 1} питань`,
          });
        } else if (result.data.next_question) {
          // Load next question after delay
          setTimeout(() => {
            setCurrentQuestion(result.data.next_question!);
            setSelectedOption(null);
            setStartTime(Date.now());
          }, 1500);
        }
      }
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

  const handleRestart = () => {
    setCurrentSubject(null);
    setCurrentSubjectName('');
    setSessionId(null);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setIsCompleted(false);
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

  // Show subject selector if no subject is selected
  if (!currentSubject) {
    return <SubjectSelector onSubjectSelect={handleSubjectSelect} />;
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Завантаження питання..." />
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
    
    return (
      <Card className="w-full max-w-2xl mx-auto gradient-card shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Тест завершено!</CardTitle>
          <CardDescription>Предмет: {currentSubjectName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-3xl font-bold text-primary">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Точність</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-3xl font-bold text-success">{correctAnswers}</p>
              <p className="text-sm text-muted-foreground">Правильних</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <p className="text-3xl font-bold text-warning">{questionsAnswered}</p>
              <p className="text-sm text-muted-foreground">Всього</p>
            </div>
          </div>
          
          <Button onClick={handleRestart} className="w-full" size="lg">
            Пройти інший тест
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Не вдалося завантажити питання</p>
          <Button onClick={handleRestart} className="mt-4">
            Повернутися до вибору предмету
          </Button>
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
            <div>
              <CardTitle>Адаптивне тестування</CardTitle>
              <CardDescription className="mt-1">
                Предмет: {currentSubjectName}
              </CardDescription>
            </div>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {getDifficultyLabel(currentQuestion.difficulty)}
            </Badge>
          </div>
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