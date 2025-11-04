import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { varkAPI } from '@/services/api';
import { VarkQuestion, VarkType } from '@/types';
import { toast } from '@/hooks/use-toast';

// Mock VARK questions for demo
const mockVarkQuestions: VarkQuestion[] = [
  {
    id: '1',
    text: 'Коли вам потрібно навчитися користуватися новим додатком, ви:',
    options: [
      { id: 'a', text: 'Дивитеся демонстраційне відео', type: 'visual' },
      { id: 'b', text: 'Слухаєте пояснення від друга', type: 'auditory' },
      { id: 'c', text: 'Читаєте інструкцію', type: 'read_write' },
      { id: 'd', text: 'Одразу починаєте користуватися і експериментуєте', type: 'kinesthetic' }
    ]
  },
  {
    id: '2',
    text: 'Ви краще запам\'ятовуєте інформацію, коли:',
    options: [
      { id: 'a', text: 'Бачите діаграми та схеми', type: 'visual' },
      { id: 'b', text: 'Слухаєте лекцію або розмову', type: 'auditory' },
      { id: 'c', text: 'Робите нотатки', type: 'read_write' },
      { id: 'd', text: 'Практикуєте або застосовуєте на практиці', type: 'kinesthetic' }
    ]
  }
  // Add more questions...
];

interface VarkTestProps {
  onComplete: (results: { visual: number; auditory: number; read_write: number; kinesthetic: number }) => void;
}

interface VarkTestProps {
  onComplete: (results: { visual: number; auditory: number; read_write: number; kinesthetic: number }) => void;
  hasExistingResult?: boolean;
}

export const VarkTest = ({ onComplete, hasExistingResult }: VarkTestProps) => {
  const [questions, setQuestions] = useState<VarkQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, VarkType>>({});
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const result = await varkAPI.getQuestions();
      if (result.success && result.data) {
        setQuestions(result.data);
      } else {
        // Use mock data for demo
        setQuestions(mockVarkQuestions);
      }
    } catch (error) {
      setQuestions(mockVarkQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const question = questions[currentQuestion];
    const option = question.options.find(opt => opt.id === selectedOption);
    if (option) {
      setAnswers(prev => ({ ...prev, [question.id]: option.type }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption('');
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    setIsSubmitting(true);
    const results = {
      visual: 0,
      auditory: 0,
      read_write: 0,
      kinesthetic: 0
    };

    Object.values(answers).forEach(type => {
      results[type]++;
    });

    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    const percentages = {
      visual: Math.round((results.visual / total) * 100),
      auditory: Math.round((results.auditory / total) * 100),
      read_write: Math.round((results.read_write / total) * 100),
      kinesthetic: Math.round((results.kinesthetic / total) * 100)
    };

    try {
      const response = await varkAPI.submitResults(percentages);
      if (response.success) {
        toast({
          title: "Успіх",
          description: hasExistingResult ? "Результати тесту оновлено" : "Результати тесту збережено",
        });
      }
    } catch (error) {
      console.error('Failed to submit VARK results:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти результати",
        variant: "destructive",
      });
    }

    onComplete(percentages);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Завантаження питань..." />
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto gradient-card shadow-elevated">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>VARK Тест стилів навчання</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        <CardDescription>
          Виберіть відповідь, яка найбільше відповідає вашому стилю навчання
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{question.text}</h3>
          
          <RadioGroup value={selectedOption} onValueChange={handleAnswerSelect}>
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
            >
              Назад
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedOption || isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : currentQuestion === questions.length - 1 ? (
                'Завершити тест'
              ) : (
                'Наступне питання'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};