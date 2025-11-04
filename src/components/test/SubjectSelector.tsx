import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { testAPI } from '@/services/api';
import { Subject } from '@/types';
import { BookOpen, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SubjectSelectorProps {
  onSubjectSelect: (subjectId: string, subjectName: string) => void;
}

export const SubjectSelector = ({ onSubjectSelect }: SubjectSelectorProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const result = await testAPI.getSubjects();
      if (result.success && result.data) {
        setSubjects(result.data);
      } else {
        toast({
          title: "Помилка",
          description: result.error || "Не вдалося завантажити предмети",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити предмети",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <LoadingSpinner size="lg" text="Завантаження предметів..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto gradient-card shadow-elevated">
      <CardHeader>
        <CardTitle>Оберіть предмет для тестування</CardTitle>
        <CardDescription>
          Виберіть предмет, з якого хочете пройти адаптивний тест
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {subjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Наразі немає доступних тестів
            </p>
          ) : (
            subjects.map((subject) => (
              <div
                key={subject.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => onSubjectSelect(subject.id, subject.name)}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-medium">{subject.name}</h4>
                    {subject.description && (
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Доступно питань: {subject.questions_count}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
