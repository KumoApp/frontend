import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Trophy, Calendar, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BASE = 'http://localhost:3000';

interface QuizHistoryProps {
  onBack: () => void;
  classId: string | number;
  studentName?: string;
}

type QuizListItem = {
  id: number | string;
  date?: string;      // ISO
  subject?: string;
  title?: string;
};

type OwnAnswerItem = {
  quizId: number | string;
  score?: number;                 // puede venir 0–100 o 0–10
  questionsCorrect?: number;
  questionsTotal?: number;
  timeSpent?: number;             // seconds
  kumoSolesEarned?: number;
  streakBonus?: boolean;
};

type QuizDetail = {
  id: number | string;
  title?: string;
  date?: string;
  subject?: string;
  totalQuestions?: number;
  questions?: Array<{
    id: number | string;
    questionNumber?: number;
    content: string;
    optionA: string; optionB: string; optionC: string; optionD: string;
    correctOption?: 'A'|'B'|'C'|'D';
  }>;
};

type OwnSingleAnswer = {
  quizId: number | string;
  answers: Array<{ questionId: number | string; option: 'A'|'B'|'C'|'D' | null }>;
  score?: number;                 // 0–100 o 0–10
  questionsCorrect?: number;
  questionsTotal?: number;
  timeSpent?: number;
};

export function QuizHistory({ onBack, classId, studentName }: QuizHistoryProps) {
  const { token } = useAuth();
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [ownAnswersMap, setOwnAnswersMap] = useState<Record<string, OwnAnswerItem>>({});

  // Modal de detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailQuiz, setDetailQuiz] = useState<QuizDetail | null>(null);
  const [detailOwn, setDetailOwn] = useState<OwnSingleAnswer | null>(null);

  // Utils: normalizar score a /10 y a %
  const scoreToTen = (s?: number | null) => {
    if (s == null) return null;
    // si ya es /10 (<=10), lo dejamos; si es /100, convertimos
    return s > 10 ? Math.round(s / 10) : Math.round(s);
  };
  const scoreToPct = (s?: number | null) => {
    if (s == null) return null;
    return s > 10 ? Math.round(s) : Math.round(s * 10);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        setLoading(true);
        setLoadError(null);

        // 1) Quizzes de la clase
        const resp = await fetch(`${BASE}/quizzes/classes/${classId}`, { headers });
        if (!resp.ok) {
          let d = ''; try { const j = await resp.json(); d = j?.message || j?.error || ''; } catch {}
          throw new Error(`HTTP ${resp.status} ${resp.statusText}${d ? ` - ${d}` : ''}`);
        }
        const listJson = await resp.json();
        const listBody = listJson?.body ?? [];
        const list: QuizListItem[] = Array.isArray(listBody) ? listBody : (listBody?.items ?? []);
        if (!cancelled) setQuizzes(list);

        // 2) Tus respuestas en la clase
        const respAns = await fetch(`${BASE}/quizzes/classes/${classId}/answers`, { headers });
        if (respAns.ok) {
          const ansJson = await respAns.json();
          const ansBody = ansJson?.body ?? [];
          const mine: OwnAnswerItem[] = Array.isArray(ansBody) ? ansBody : (ansBody?.items ?? []);
          if (!cancelled) {
            const map: Record<string, OwnAnswerItem> = {};
            for (const m of mine) map[String(m.quizId)] = m;
            setOwnAnswersMap(map);
          }
        } else {
          console.warn('GET /quizzes/classes/:id/answers no OK (continúo sin romper UI)');
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('Error getallquizzes:', e);
          setLoadError(e?.message || 'No se pudo cargar el historial de quizzes.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (token && classId) loadAll();
    return () => { cancelled = true; };
  }, [headers, token, classId]);

  const openDetail = async (quizId: number | string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailQuiz(null);
    setDetailOwn(null);
    try {
      // 1) Detalle del quiz (preguntas + correctOption)
      const r1 = await fetch(`${BASE}/quizzes/${quizId}`, { headers });
      if (!r1.ok) {
        let d = ''; try { const j = await r1.json(); d = j?.message || j?.error || ''; } catch {}
        throw new Error(`HTTP ${r1.status} ${r1.statusText}${d ? ` - ${d}` : ''}`);
      }
      const qJson = await r1.json();
      const qBody = qJson?.body ?? {};
      const detail: QuizDetail = {
        id: qBody?.id ?? quizId,
        title: qBody?.title,
        date: qBody?.date,
        subject: qBody?.subject,
        totalQuestions: qBody?.totalQuestions,
        questions: (qBody?.questions ?? []).map((q: any) => ({
          id: q.id,
          questionNumber: q.questionNumber,
          content: q.content,
          optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
          correctOption: q.correctOption,
        })),
      };
      setDetailQuiz(detail);

      // 2) Tus respuestas propias a ese quiz
      const r2 = await fetch(`${BASE}/quizzes/${quizId}/answer`, { headers });
      if (r2.ok) {
        const aJson = await r2.json();
        const aBody = aJson?.body ?? {};
        const own: OwnSingleAnswer = {
          quizId: aBody?.quizId ?? quizId,
          answers: (aBody?.answers ?? []).map((a: any) => ({
            questionId: a.questionId,
            option: a.option ?? null,
          })),
          score: aBody?.score,
          questionsCorrect: aBody?.questionsCorrect,
          questionsTotal: aBody?.questionsTotal,
          timeSpent: aBody?.timeSpent,
        };
        setDetailOwn(own);
      } else {
        console.warn('GET /quizzes/:id/answer no OK (sin respuestas propias)');
      }
    } catch (e: any) {
      console.error('Error getquizinfo / getownanswer:', e);
      setDetailError(e?.message || 'No se pudo cargar el detalle del quiz.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailQuiz(null);
    setDetailOwn(null);
    setDetailError(null);
  };

  const formatTime = (sec?: number) => {
    if (sec == null) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScoreBadge = (score10?: number | null) => {
    if (score10 == null) return { variant: 'secondary' as const, className: 'bg-gray-300 text-gray-800', label: 'Sin nota' };
    const pct = score10 * 10;
    if (pct >= 90) return { variant: 'default' as const, className: 'bg-green-500', label: 'Excelente' };
    if (pct >= 80) return { variant: 'secondary' as const, className: 'bg-blue-500 text-white', label: 'Muy Bien' };
    if (pct >= 70) return { variant: 'secondary' as const, className: 'bg-yellow-500 text-white', label: 'Bien' };
    return { variant: 'secondary' as const, className: 'bg-orange-500 text-white', label: 'A Mejorar' };
  };

  // Stats (usamos solo respondidos con score válido)
  const completed = quizzes.filter(q => ownAnswersMap[String(q.id)]?.score != null);
  const totalQuizzes = quizzes.length;
  const averageScore10 = completed.length
    ? Math.round(
        completed.reduce((sum, q) => {
          const s = ownAnswersMap[String(q.id)]?.score ?? null;
          const s10 = scoreToTen(s) ?? 0;
          return sum + s10;
        }, 0) / completed.length
      )
    : 0;
  const totalKumoSoles = completed.reduce((sum, q) => sum + (ownAnswersMap[String(q.id)]?.kumoSolesEarned ?? 0), 0);
  const perfectScores = completed.filter(q => (scoreToTen(ownAnswersMap[String(q.id)]?.score) ?? 0) >= 10).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader><CardTitle>Cargando historial…</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Conectando…</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader><CardTitle>Error al cargar</CardTitle></CardHeader>
            <CardContent className="text-sm text-red-600">{loadError}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Historial de Quizzes {studentName ? `- ${studentName}` : ''}
              </h1>
              <p className="text-gray-600">Clase ID: {classId}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2"><CheckCircle className="h-6 w-6 text-green-500" /></div>
              <p className="text-2xl font-bold text-primary">{totalQuizzes}</p>
              <p className="text-sm text-gray-600">Quizzes en la clase</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2"><TrendingUp className="h-6 w-6 text-blue-500" /></div>
              <p className="text-2xl font-bold text-primary">{averageScore10}/10</p>
              <p className="text-sm text-gray-600">Promedio (respondidos)</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2"><Trophy className="h-6 w-6 text-yellow-500" /></div>
              <p className="text-2xl font-bold text-primary">{totalKumoSoles}</p>
              <p className="text-sm text-gray-600">KumoSoles Ganados</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2"><Trophy className="h-6 w-6 text-purple-500" /></div>
              <p className="text-2xl font-bold text-primary">{perfectScores}</p>
              <p className="text-sm text-gray-600">Puntajes 10/10</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Historial Detallado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizzes.map((q) => {
                const mine = ownAnswersMap[String(q.id)];
                const s10 = scoreToTen(mine?.score);
                const scoreBadge = getScoreBadge(s10);
                const dateTxt = q.date
                  ? new Date(q.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';
                return (
                  <div key={String(q.id)} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-16">
                        <span className="text-2xl font-bold text-primary">{s10 != null ? `${s10}/10` : '—'}</span>
                        <Badge className={scoreBadge.className} variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{q.title || q.subject || 'Quiz'}</h3>
                          {mine?.streakBonus && (
                            <Badge variant="secondary" className="text-xs"><Trophy className="h-3 w-3 mr-1" /> Bonus x1.25</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateTxt}
                          </span>
                          <span className="flex items-center gap-1">
                            {mine?.questionsCorrect != null && mine?.questionsTotal != null ? (
                              <>
                                {mine.questionsCorrect === mine.questionsTotal
                                  ? <CheckCircle className="h-3 w-3 text-green-500" />
                                  : <XCircle className="h-3 w-3 text-gray-400" />
                                }
                                {mine.questionsCorrect}/{mine.questionsTotal} correctas
                              </>
                            ) : '—'}
                          </span>
                          <span>⏱️ {formatTime(mine?.timeSpent)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDetail(q.id)} title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {quizzes.length === 0 && (
                <div className="text-sm text-muted-foreground">No hay quizzes en esta clase.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Detalle (scrollable + volver/cerrar) */}
      {detailOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl bg-white">
            <CardHeader className="sticky top-0 bg-white border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {detailQuiz?.title || detailQuiz?.subject || `Quiz ${detailQuiz?.id ?? ''}`}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onBack}>Regresar</Button>
                  <Button variant="ghost" size="sm" onClick={closeDetail}>Cerrar</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
              {detailLoading && <div className="text-sm text-muted-foreground">Cargando…</div>}
              {detailError && <div className="text-sm text-red-600">{detailError}</div>}
              {!detailLoading && !detailError && detailQuiz && (
                <>
                  <div className="text-sm text-gray-600">
                    <div>Fecha: {detailQuiz.date ? new Date(detailQuiz.date).toLocaleString('es-ES') : '—'}</div>
                    <div>Total de preguntas: {detailQuiz.totalQuestions ?? detailQuiz.questions?.length ?? '—'}</div>
                    {(() => {
                      const s10 = scoreToTen(detailOwn?.score);
                      return s10 != null ? <div className="mt-1">Tu puntaje: <b>{s10}/10</b></div> : null;
                    })()}
                  </div>

                  <div className="space-y-3">
                    {(detailQuiz.questions ?? []).map((q) => {
                      const myOpt = detailOwn?.answers?.find(a => String(a.questionId) === String(q.id))?.option ?? null;
                      const correct = q.correctOption ?? null;
                      const options = [
                        { k: 'A' as const, v: q.optionA },
                        { k: 'B' as const, v: q.optionB },
                        { k: 'C' as const, v: q.optionC },
                        { k: 'D' as const, v: q.optionD },
                      ];
                      return (
                        <div key={String(q.id)} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">#{q.questionNumber ?? '?'} — {q.content}</div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {options.map(o => {
                              const picked = myOpt === o.k;
                              const isCorrect = correct === o.k;
                              const style =
                                isCorrect ? 'border-green-300 bg-green-50' :
                                picked ? 'border-red-300 bg-red-50' : 'border-muted';
                              return (
                                <div key={o.k} className={`p-2 border rounded ${style}`}>
                                  <span className="font-semibold mr-2">{o.k}.</span>{o.v}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer con acciones también abajo */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onBack}>Regresar</Button>
                    <Button variant="ghost" onClick={closeDetail}>Cerrar</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
