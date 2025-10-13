import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface QuizHistoryProps {
  onBack: () => void;
  studentName?: string;
}

interface QuizRecord {
  id: string;
  date: Date;
  subject: string;
  score: number;
  questionsCorrect: number;
  questionsTotal: number;
  kumoSolesEarned: number;
  streakBonus: boolean;
  timeSpent: number; // in seconds
}

export function QuizHistory({ onBack, studentName }: QuizHistoryProps) {
  // Mock quiz history data
  const quizHistory: QuizRecord[] = [
    {
      id: '1',
      date: new Date('2024-10-01'),
      subject: 'Matemáticas',
      score: 85,
      questionsCorrect: 17,
      questionsTotal: 20,
      kumoSolesEarned: 106,
      streakBonus: true,
      timeSpent: 245
    },
    {
      id: '2',
      date: new Date('2024-09-30'),
      subject: 'Historia',
      score: 92,
      questionsCorrect: 23,
      questionsTotal: 25,
      kumoSolesEarned: 115,
      streakBonus: true,
      timeSpent: 310
    },
    {
      id: '3',
      date: new Date('2024-09-29'),
      subject: 'Ciencias',
      score: 78,
      questionsCorrect: 14,
      questionsTotal: 18,
      kumoSolesEarned: 97,
      streakBonus: true,
      timeSpent: 280
    },
    {
      id: '4',
      date: new Date('2024-09-28'),
      subject: 'Literatura',
      score: 88,
      questionsCorrect: 22,
      questionsTotal: 25,
      kumoSolesEarned: 110,
      streakBonus: true,
      timeSpent: 295
    },
    {
      id: '5',
      date: new Date('2024-09-27'),
      subject: 'Matemáticas',
      score: 95,
      questionsCorrect: 19,
      questionsTotal: 20,
      kumoSolesEarned: 119,
      streakBonus: false,
      timeSpent: 220
    },
    {
      id: '6',
      date: new Date('2024-09-26'),
      subject: 'Geografía',
      score: 70,
      questionsCorrect: 14,
      questionsTotal: 20,
      kumoSolesEarned: 70,
      streakBonus: false,
      timeSpent: 340
    },
    {
      id: '7',
      date: new Date('2024-09-25'),
      subject: 'Historia',
      score: 82,
      questionsCorrect: 16,
      questionsTotal: 20,
      kumoSolesEarned: 82,
      streakBonus: false,
      timeSpent: 260
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, className: 'bg-green-500', label: 'Excelente' };
    if (score >= 80) return { variant: 'secondary' as const, className: 'bg-blue-500 text-white', label: 'Muy Bien' };
    if (score >= 70) return { variant: 'secondary' as const, className: 'bg-yellow-500 text-white', label: 'Bien' };
    return { variant: 'secondary' as const, className: 'bg-orange-500 text-white', label: 'A Mejorar' };
  };

  // Calculate statistics
  const totalQuizzes = quizHistory.length;
  const averageScore = Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / totalQuizzes);
  const totalKumoSoles = quizHistory.reduce((sum, quiz) => sum + quiz.kumoSolesEarned, 0);
  const perfectScores = quizHistory.filter(quiz => quiz.score >= 95).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Historial de Quizzes {studentName ? `- ${studentName}` : ''}
              </h1>
              <p className="text-gray-600">Revisa tu desempeño en todos los quizzes completados</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{totalQuizzes}</p>
              <p className="text-sm text-gray-600">Quizzes Completados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{averageScore}%</p>
              <p className="text-sm text-gray-600">Promedio General</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{totalKumoSoles}</p>
              <p className="text-sm text-gray-600">KumoSoles Ganados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{perfectScores}</p>
              <p className="text-sm text-gray-600">Puntuaciones +95%</p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz History List */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial Detallado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizHistory.map((quiz, index) => {
                const scoreBadge = getScoreBadge(quiz.score);
                return (
                  <div 
                    key={quiz.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-16">
                        <span className="text-2xl font-bold text-primary">{quiz.score}%</span>
                        <Badge className={scoreBadge.className} variant={scoreBadge.variant}>
                          {scoreBadge.label}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{quiz.subject}</h3>
                          {quiz.streakBonus && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              Bonus x1.25
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {quiz.date.toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            {quiz.questionsCorrect === quiz.questionsTotal ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-gray-400" />
                            )}
                            {quiz.questionsCorrect}/{quiz.questionsTotal} correctas
                          </span>
                          <span>⏱️ {formatTime(quiz.timeSpent)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                          <Trophy className="h-4 w-4" />
                          +{quiz.kumoSolesEarned}
                        </div>
                        <p className="text-xs text-gray-500">KumoSoles</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
