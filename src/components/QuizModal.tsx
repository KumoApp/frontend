import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { X, Clock, Trophy, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizModalProps {
  onClose: () => void;
  onComplete: (score: number) => void;
  streakMultiplier: number;
}

export function QuizModal({ onClose, onComplete, streakMultiplier }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Mock quiz questions
  const questions: Question[] = [
    {
      id: '1',
      question: '¿Cuál es la fórmula para resolver una ecuación de segundo grado?',
      options: [
        'x = -b ± √(b² - 4ac) / 2a',
        'x = -b ± √(b² + 4ac) / 2a',
        'x = b ± √(b² - 4ac) / 2a',
        'x = -b ± √(b² - 4ac) / a'
      ],
      correctAnswer: 0,
      explanation: 'La fórmula cuadrática es x = -b ± √(b² - 4ac) / 2a, donde a, b y c son los coeficientes de la ecuación ax² + bx + c = 0.'
    },
    {
      id: '2',
      question: '¿En qué año comenzó la Segunda Guerra Mundial?',
      options: ['1938', '1939', '1940', '1941'],
      correctAnswer: 1,
      explanation: 'La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana de Polonia.'
    },
    {
      id: '3',
      question: '¿Cuál es el planeta más grande del sistema solar?',
      options: ['Saturno', 'Neptuno', 'Júpiter', 'Urano'],
      correctAnswer: 2,
      explanation: 'Júpiter es el planeta más grande del sistema solar, con una masa mayor que todos los demás planetas combinados.'
    },
    {
      id: '4',
      question: '¿Quién escribió "Don Quijote de la Mancha"?',
      options: ['Lope de Vega', 'Miguel de Cervantes', 'Francisco de Quevedo', 'Calderón de la Barca'],
      correctAnswer: 1,
      explanation: 'Miguel de Cervantes Saavedra escribió "Don Quijote de la Mancha", considerada una de las obras más importantes de la literatura española.'
    },
    {
      id: '5',
      question: '¿Cuál es el símbolo químico del oro?',
      options: ['Go', 'Au', 'Ag', 'Or'],
      correctAnswer: 1,
      explanation: 'El símbolo químico del oro es Au, que proviene del latín "aurum".'
    }
  ];

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinishQuiz();
    }
  }, [timeLeft, showResults]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    let correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index]?.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateReward = () => {
    const baseReward = 100;
    return Math.floor(baseReward * (score / 100) * streakMultiplier);
  };

  if (showResults) {
    const reward = calculateReward();
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {score >= 80 ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : score >= 60 ? (
                <Badge className="h-16 w-16 text-blue-500" />
              ) : (
                <Clock className="h-16 w-16 text-gray-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {score >= 80 ? '¡Excelente trabajo!' : score >= 60 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">Tu puntuación: <span className="font-bold text-primary">{score}%</span></p>
            
            <div className="bg-accent/20 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Recompensa obtenida</span>
              </div>
              <p className="text-2xl font-bold text-primary">{reward} KumoSoles</p>
              {streakMultiplier > 1 && (
                <Badge variant="secondary" className="mt-2">
                  Bonus de racha: x{streakMultiplier}
                </Badge>
              )}
            </div>

            <div className="text-left bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Respuestas correctas:</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={question.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${
                        selectedAnswers[index] === question.correctAnswer 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span>Pregunta {index + 1}</span>
                    </div>
                    {selectedAnswers[index] !== question.correctAnswer && (
                      <p className="text-xs text-gray-600 ml-6 mt-1">
                        Respuesta correcta: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                onComplete(score);
                onClose();
              }}
              className="w-full"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Quiz Diario - Pregunta {currentQuestion + 1} de {questions.length}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
          {streakMultiplier > 1 && (
            <Badge variant="secondary" className="w-fit">
              Bonus de racha activo: x{streakMultiplier} KumoSoles
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{questions[currentQuestion]?.question}</h3>
            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                  className="w-full text-left justify-start p-4 h-auto"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Finalizar Quiz' : 'Siguiente Pregunta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}