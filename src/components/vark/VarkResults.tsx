import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Headphones, BookOpen, Hand } from 'lucide-react';

interface VarkResultsProps {
  results: {
    visual: number;
    auditory: number;
    read_write: number;
    kinesthetic: number;
  };
  onStartAdaptiveTest: () => void;
}

export const VarkResults = ({ results, onStartAdaptiveTest }: VarkResultsProps) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'visual':
        return <Eye className="h-6 w-6" />;
      case 'auditory':
        return <Headphones className="h-6 w-6" />;
      case 'read_write':
        return <BookOpen className="h-6 w-6" />;
      case 'kinesthetic':
        return <Hand className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'visual':
        return 'Візуальний';
      case 'auditory':
        return 'Аудіальний';
      case 'read_write':
        return 'Читання/Письмо';
      case 'kinesthetic':
        return 'Кінестетичний';
      default:
        return type;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'visual':
        return 'Ви краще засвоюєте інформацію через зображення, діаграми та візуальні матеріали.';
      case 'auditory':
        return 'Ви краще засвоюєте інформацію через слухання, обговорення та аудіо матеріали.';
      case 'read_write':
        return 'Ви краще засвоюєте інформацію через читання та письмо, нотатки та текстові матеріали.';
      case 'kinesthetic':
        return 'Ви краще засвоюєте інформацію через практику, експерименти та фізичну активність.';
      default:
        return '';
    }
  };

  const dominantType = Object.entries(results).reduce((a, b) => 
    results[a[0] as keyof typeof results] > results[b[0] as keyof typeof results] ? a : b
  )[0];

  return (
    <div className="space-y-6">
      <Card className="gradient-card shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ваші результати VARK тесту</CardTitle>
          <CardDescription>
            Ваш домінуючий стиль навчання: <strong>{getTypeLabel(dominantType)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(results).map(([type, percentage]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIconForType(type)}
                    <span className="font-medium">{getTypeLabel(type)}</span>
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {getTypeDescription(type)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle>Рекомендації для навчання</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-primary mb-2">
                На основі вашого домінуючого стилю ({getTypeLabel(dominantType)}):
              </h4>
              <p className="text-sm">{getTypeDescription(dominantType)}</p>
            </div>
            
            <Button 
              onClick={onStartAdaptiveTest} 
              variant="hero" 
              className="w-full"
              size="lg"
            >
              Розпочати адаптивне тестування
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};