import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { X, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { quizService, QuizFullResponse, AnswerDailyQuizResponse } from '../services/api';

interface QuizModalProps {
  classId: string | number;
  onClose: () => void;
  onComplete: (score: number) => void;
  streakMultiplier: number;
}

export function QuizModal({
  classId,
  onClose,
  onComplete,
  streakMultiplier,
}: QuizModalProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<
    Array<{ id: number; questionNumber: number; content: string; options: string[] }>
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | undefined>>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // === Cargar quiz diario ===
  useEffect(() => {
    let cancelled = false;

    async function loadDaily() {
      if (!token) {
        setLoadError('No hay sesión activa (token). Inicia sesión para cargar el quiz.');
        setLoading(false);
        return;
      }
      if (classId === undefined || classId === null || classId === '') {
        setLoadError('classId inválido o no provisto.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);

        // Primero verificar si ya se respondió el quiz diario de hoy
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Obtener el quiz diario para saber su ID
          const quizData: QuizFullResponse = await quizService.getDailyQuiz(Number(classId));
          
          if (!quizData || !quizData.id) {
            throw new Error('No se pudo obtener el quiz diario.');
          }

          // Verificar si ya hay respuestas para este quiz
          const allAnswers = await quizService.getAllOwnAnswers(Number(classId));
          const quizAlreadyAnswered = allAnswers.some(answer => answer.quizId === quizData.id);

          if (quizAlreadyAnswered) {
            if (!cancelled) {
              setLoadError('Ya has completado el quiz diario de hoy. Vuelve mañana para un nuevo quiz.');
            }
            return;
          }

          // Si no está respondido, cargar las preguntas
          if (!quizData || !Array.isArray(quizData.questions)) {
            throw new Error('Respuesta inesperada del backend: faltan preguntas.');
          }

          const mapped = quizData.questions
            .slice()
            .sort((a, b) => a.questionNumber - b.questionNumber)
            .map((q) => ({
              id: q.id,
              questionNumber: q.questionNumber,
              content: q.content,
              options: [q.optionA, q.optionB, q.optionC, q.optionD],
            }));

          if (!cancelled) {
            setQuestions(mapped);
            setSelectedAnswers(Array(mapped.length).fill(undefined));
            setCurrentQuestion(0);
            setSubmitError(null);
          }
        } catch (e: any) {
          // Si el error es que ya está respondido, no hacer nada más
          if (e?.message?.includes('Ya has completado')) {
            return;
          }
          throw e;
        }
      } catch (e: any) {
        if (!cancelled) {
          // Verificar si el error es porque ya se respondió
          if (e?.response?.status === 400 || e?.response?.status === 409) {
            setLoadError('Ya has completado el quiz diario de hoy. Vuelve mañana para un nuevo quiz.');
          } else {
            setLoadError(e?.message || 'No se pudo cargar el quiz diario.');
          }
          console.error('Error getdailyquiz:', e);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDaily();

    return () => {
      cancelled = true;
    };
  }, [token, classId]);

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestion] = optionIndex; // 0..3
      return copy;
    });
    setSubmitError(null);
  };

  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestion] === undefined) return;
    if (currentQuestion < questions.length - 1) setCurrentQuestion((q) => q + 1);
    else void handleFinishQuiz();
  };

  const handleFinishQuiz = async () => {
    setSubmitError(null);

    // Verifica que todas estén respondidas (para no mandar undefined)
    const firstUnanswered = selectedAnswers.findIndex((a) => a === undefined);
    if (firstUnanswered !== -1) {
      setCurrentQuestion(firstUnanswered);
      setSubmitError('Responde todas las preguntas antes de enviar.');
      return;
    }

    // === Payload EXACTO que pide tu backend ===
    // { "answers": [0, 2, 1, ...] } donde A=0, B=1, C=2, D=3
    const answersArray = (selectedAnswers as number[]).map((a) => Number(a));

    let finalScore = 0;

    try {
      // Backend returns data directly, not wrapped in { code, message, body }
      const response: AnswerDailyQuizResponse = await quizService.answerDailyQuiz(Number(classId), {
        answers: answersArray,
      });

      // Calculate score as percentage
      if (response.score != null && response.total != null) {
        finalScore = Math.round((response.score / response.total) * 100);
      } else if (response.score != null) {
        finalScore = Math.max(0, Math.min(100, Math.round(response.score)));
      } else {
        // Fallback: calculate from correct array
        const correctCount = response.correct?.filter((c) => c).length ?? 0;
        finalScore = Math.round((correctCount / Math.max(1, answersArray.length)) * 100);
      }
    } catch (e: any) {
      // Verificar si el error es porque ya se respondió el quiz
      if (e?.response?.status === 400 || e?.response?.status === 409) {
        setSubmitError('Ya has completado el quiz diario de hoy. No puedes responderlo dos veces.');
        setShowResults(false);
        return;
      }
      
      const answered = answersArray.length;
      finalScore = Math.round((answered / Math.max(1, questions.length)) * 100);
      setSubmitError(`No se pudo comunicar con el servidor: ${e?.message || 'Error desconocido'}`);
      console.error('Fallo al enviar answerdailyquiz:', e);
    }

    setScore(finalScore);
    setShowResults(true);
  };

  const reward = (s: number) => Math.floor(100 * (s / 100) * streakMultiplier);

  // --- Render states ---
  if (!token) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader><CardTitle>Sesión requerida</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-600">No hay token disponible. Inicia sesión para acceder al quiz.</p>
            <div className="flex justify-end"><Button variant="outline" onClick={onClose}>Cerrar</Button></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader><CardTitle>Cargando quiz diario…</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Conectando…</CardContent>
        </Card>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader><CardTitle>{loadError ? 'Error' : 'Sin preguntas hoy'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {loadError ? <p className="text-sm text-red-600">{loadError}</p> : <p className="text-sm">Vuelve más tarde.</p>}
            <div className="flex justify-end"><Button variant="outline" onClick={onClose}>Cerrar</Button></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4"><Trophy className="h-16 w-16 text-yellow-500" /></div>
            <CardTitle className="text-2xl">
              {score >= 80 ? '¡Excelente trabajo!' : score >= 60 ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-2">
                {submitError}
              </div>
            )}
            <p className="text-lg">Tu puntuación: <span className="font-bold text-primary">{score}%</span></p>
            <div className="bg-accent/20 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Recompensa obtenida</span>
              </div>
              <p className="text-2xl font-bold text-primary">{reward(score)} KumoSoles</p>
              {streakMultiplier > 1 && (
                <Badge variant="secondary" className="mt-2">Bonus de racha: x{streakMultiplier}</Badge>
              )}
            </div>
            <Button
              onClick={() => { onComplete(score); onClose(); }}
              className="w-full"
            >
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Quiz Diario — Pregunta {currentQuestion + 1} de {questions.length}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
          <Progress value={progress} className="h-2" />
          {streakMultiplier > 1 && (
            <Badge variant="secondary" className="w-fit">Bonus de racha: x{streakMultiplier} KumoSoles</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {submitError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {submitError}
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium mb-4">{q.content}</h3>
            <div className="space-y-3">
              {q.options.map((option, idx) => (
                <Button
                  key={idx}
                  variant={selectedAnswers[currentQuestion] === idx ? 'default' : 'outline'}
                  className="w-full text-left justify-start p-4 h-auto"
                  onClick={() => handleAnswerSelect(idx)}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleNextQuestion} disabled={selectedAnswers[currentQuestion] === undefined}>
              {currentQuestion === questions.length - 1 ? 'Finalizar Quiz' : 'Siguiente Pregunta'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
