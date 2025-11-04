import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { X, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_BASE = 'http://localhost:3000';

type DailyQuizAPI = {
  code: number;
  message: string;
  body: {
    id: number;
    totalQuestions: number;
    date: string;
    questions: Array<{
      id: number;
      questionNumber: number;
      content: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
    }>;
  };
};

type SubmitDailyResp =
  | { code: number; message: string; body?: { score?: number; correctCount?: number; total?: number } }
  | any;

interface QuizModalProps {
  classId: string | number;
  onClose: () => void;
  onComplete: (score: number) => void;
  streakMultiplier: number;
  baseUrl?: string;
}

export function QuizModal({
  classId,
  onClose,
  onComplete,
  streakMultiplier,
  baseUrl = DEFAULT_BASE,
}: QuizModalProps) {
  const { token } = useAuth();
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    [token]
  );

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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

        const url = `${baseUrl}/quizzes/classes/${classId}/daily`;
        const resp = await fetch(url, { headers, signal: controller.signal });

        if (!resp.ok) {
          let detail = '';
          try {
            const j = await resp.json();
            detail = j?.message || j?.error || '';
          } catch {}
          throw new Error(`GET /daily → HTTP ${resp.status} ${resp.statusText}${detail ? ` - ${detail}` : ''}`);
        }

        const json: DailyQuizAPI = await resp.json();
        const b = json?.body;

        if (!b || !Array.isArray(b.questions)) {
          throw new Error('Respuesta inesperada del backend: faltan preguntas.');
        }

        const mapped = b.questions
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
        if (!cancelled) {
          if (e?.name === 'AbortError') {
            setLoadError('La solicitud tardó demasiado (timeout). Verifica el backend o la red.');
          } else {
            setLoadError(e?.message || 'No se pudo cargar el quiz diario.');
          }
          console.error('Error getdailyquiz:', e);
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    }

    loadDaily();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [headers, token, classId, baseUrl]);

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
    // { "answers": [0, 2, 1, ...] }
    const answersArray = (selectedAnswers as number[]).map((a) => Number(a));
    const payload = { answers: answersArray };

    let finalScore = 0;

    try {
      const resp = await fetch(`${baseUrl}/quizzes/classes/${classId}/daily/answer`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        let detailMsg = `HTTP ${resp.status} ${resp.statusText}`;
        try {
          const txt = await resp.text();
          try {
            const j = JSON.parse(txt);
            detailMsg = j?.message || j?.error || detailMsg;
          } catch {
            if (txt) detailMsg = `${detailMsg} - ${txt}`;
          }
        } catch {}
        setSubmitError(`No se pudo enviar tus respuestas: ${detailMsg}`);
        // Proxy: porcentaje contestadas (aquí deberían ser todas, así que 100)
        finalScore = Math.round((answersArray.length / Math.max(1, questions.length)) * 100);
        setScore(finalScore);
        setShowResults(true);
        return;
      }

      // OK: intenta leer el resultado (score/correctCount/total)
      let data: SubmitDailyResp | null = null;
      try {
        data = await resp.json();
      } catch {
        data = null;
      }

      const s = data?.body?.score;
      if (typeof s === 'number' && !Number.isNaN(s)) {
        finalScore = Math.max(0, Math.min(100, Math.round(s)));
      } else if (data?.body?.correctCount != null && data?.body?.total != null) {
        finalScore = Math.round((data.body.correctCount / Math.max(1, data.body.total)) * 100);
      } else {
        // si no hay score, asume 100% contestadas
        finalScore = 100;
      }
    } catch (e: any) {
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
