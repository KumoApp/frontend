import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  quizService,
  QuizSmallResponse,
  QuizFullResponse,
  QuizAnswerSmallResponse,
  QuizAnswerFullResponse,
} from "../services/api";

interface QuizHistoryProps {
  onBack: () => void;
  classId: string | number;
  studentName?: string;
}

// Using types from API service
type OwnAnswerItem = QuizAnswerSmallResponse & {
  timeSpent?: number;
  kumoSolesEarned?: number;
  streakBonus?: boolean;
};

export function QuizHistory({
  onBack,
  classId,
  studentName,
}: QuizHistoryProps) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSmallResponse[]>([]);
  const [ownAnswersMap, setOwnAnswersMap] = useState<
    Record<string, OwnAnswerItem>
  >({});

  // Modal de detalle
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailQuiz, setDetailQuiz] = useState<QuizFullResponse | null>(null);
  const [detailOwn, setDetailOwn] = useState<QuizAnswerFullResponse | null>(
    null,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      // Validar que classId sea válido
      const hasValidClass =
        classId !== null &&
        classId !== undefined &&
        String(classId).trim() !== "";
      if (!hasValidClass) {
        setLoadError(
          "No se ha seleccionado una clase. Por favor, selecciona una clase primero.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);

        // 1) Quizzes de la clase - Backend returns data directly
        const quizzesList: QuizSmallResponse[] =
          await quizService.getQuizzesFromClass(classId);
        // Asegurar que sea un array
        const safeQuizzesList = Array.isArray(quizzesList) ? quizzesList : [];
        if (!cancelled) setQuizzes(safeQuizzesList);

        // 2) Tus respuestas en la clase - Backend returns data directly
        try {
          const answersList: QuizAnswerSmallResponse[] =
            await quizService.getAllOwnAnswers(classId);
          // Asegurar que sea un array
          const safeAnswersList = Array.isArray(answersList) ? answersList : [];
          if (!cancelled) {
            const map: Record<string, OwnAnswerItem> = {};
            for (const m of safeAnswersList) {
              map[String(m.quizId)] = m;
            }
            setOwnAnswersMap(map);
          }
        } catch (e: any) {
          console.warn(
            "GET /quizzes/classes/:id/answers no OK (continúo sin romper UI):",
            e,
          );
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Error getallquizzes:", e);
          setLoadError(
            e?.message || "No se pudo cargar el historial de quizzes.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (
      token &&
      classId !== null &&
      classId !== undefined &&
      String(classId).trim() !== ""
    )
      loadAll();
    return () => {
      cancelled = true;
    };
  }, [token, classId]);

  const openDetail = async (quizId: number | string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailQuiz(null);
    setDetailOwn(null);
    try {
      // 1) Detalle del quiz (preguntas) - Backend returns data directly
      const quizDetail: QuizFullResponse = await quizService.getQuizInfoById(
        Number(quizId),
      );
      setDetailQuiz(quizDetail);

      // 2) Tus respuestas propias a ese quiz - Backend returns data directly
      try {
        const ownAnswer: QuizAnswerFullResponse =
          await quizService.getOwnAnswer(Number(quizId));
        setDetailOwn(ownAnswer);
      } catch (e: any) {
        console.warn(
          "GET /quizzes/:id/answer no OK (sin respuestas propias):",
          e,
        );
      }
    } catch (e: any) {
      console.error("Error getquizinfo / getownanswer:", e);
      setDetailError(e?.message || "No se pudo cargar el detalle del quiz.");
    } finally {
      setDetailLoading(false);
    }
  };

  // Resetear scroll cuando se abre el modal o cuando se carga el contenido
  useEffect(() => {
    if (detailOpen && !detailLoading && scrollContainerRef.current) {
      // Resetear scroll cuando el contenido está listo
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [detailOpen, detailLoading, detailQuiz]);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailQuiz(null);
    setDetailOwn(null);
    setDetailError(null);
  };

  const formatTime = (sec?: number) => {
    if (sec == null) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScoreBadge = (score10?: number | null) => {
    if (score10 == null)
      return {
        variant: "secondary" as const,
        className: "bg-gray-300 text-gray-800",
        label: "Sin nota",
      };
    const pct = score10 * 10;
    if (pct >= 90)
      return {
        variant: "default" as const,
        className: "bg-green-500",
        label: "Excelente",
      };
    if (pct >= 80)
      return {
        variant: "secondary" as const,
        className: "bg-blue-500 text-white",
        label: "Muy Bien",
      };
    if (pct >= 70)
      return {
        variant: "secondary" as const,
        className: "bg-yellow-500 text-white",
        label: "Bien",
      };
    return {
      variant: "secondary" as const,
      className: "bg-orange-500 text-white",
      label: "A Mejorar",
    };
  };

  // Stats (usamos solo respondidos con score válido)
  // Asegurar que quizzes sea un array antes de usar métodos de array
  const safeQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const completed = safeQuizzes.filter(
    (q) => ownAnswersMap[String(q.id)]?.score != null,
  );
  const totalQuizzes = safeQuizzes.length;
  const averageScore10 = completed.length
    ? Math.round(
        completed.reduce((sum, q) => {
          const s = ownAnswersMap[String(q.id)]?.score ?? null;
          const s10 = scoreToTen(s) ?? 0;
          return sum + s10;
        }, 0) / completed.length,
      )
    : 0;
  const totalKumoSoles = completed.reduce(
    (sum, q) => sum + (ownAnswersMap[String(q.id)]?.kumoSolesEarned ?? 0),
    0,
  );
  const perfectScores = completed.filter(
    (q) => (scoreToTen(ownAnswersMap[String(q.id)]?.score) ?? 0) >= 10,
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle>Cargando historial…</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Conectando…
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle>Error al cargar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-600">
              {loadError}
            </CardContent>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Historial de Quizzes {studentName ? `- ${studentName}` : ""}
              </h1>
              <p className="text-gray-600">Clase ID: {classId}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-primary">{totalQuizzes}</p>
              <p className="text-sm text-gray-600">Quizzes en la clase</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {averageScore10}/10
              </p>
              <p className="text-sm text-gray-600">Promedio (respondidos)</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {totalKumoSoles}
              </p>
              <p className="text-sm text-gray-600">KumoSoles Ganados</p>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
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
              {safeQuizzes.map((q) => {
                const mine = ownAnswersMap[String(q.id)];
                const s10 = scoreToTen(mine?.score);
                const scoreBadge = getScoreBadge(s10);
                const dateTxt = q.date
                  ? new Date(q.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <div
                    key={String(q.id)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-16">
                        <span className="text-2xl font-bold text-primary">
                          {s10 != null ? `${s10}/10` : "—"}
                        </span>
                        <Badge
                          className={scoreBadge.className}
                          variant={scoreBadge.variant}
                        >
                          {scoreBadge.label}
                        </Badge>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">
                            Quiz {q.id}
                          </h3>
                          {mine?.streakBonus && (
                            <Badge variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" /> Bonus x1.25
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateTxt}
                          </span>
                          <span className="flex items-center gap-1">
                            {mine?.score != null && mine?.total != null ? (
                              <>
                                {mine.score === mine.total ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-400" />
                                )}
                                {mine.score}/{mine.total} correctas
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                          <span>⏱️ {formatTime(mine?.timeSpent)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(q.id)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {safeQuizzes.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No hay quizzes en esta clase.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Detalle (scrollable + volver/cerrar) */}
      {detailOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <Card
            className="w-full max-w-3xl bg-white flex flex-col shadow-xl"
            style={{ maxHeight: "90vh", height: "90vh" }}
          >
            <CardHeader className="bg-white border-b flex-shrink-0 px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Quiz {detailQuiz?.id ?? ""}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onBack}>
                    Regresar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeDetail}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Área scrollable: ocupa el resto de la altura */}
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto flex-1 min-h-0"
            >
              <CardContent className="space-y-4 px-6 py-4">
                {detailLoading && (
                  <div className="text-sm text-muted-foreground">Cargando…</div>
                )}
                {detailError && (
                  <div className="text-sm text-red-600">{detailError}</div>
                )}
                {!detailLoading && !detailError && detailQuiz && (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      <div>
                        Fecha:{" "}
                        {detailQuiz.date
                          ? new Date(detailQuiz.date).toLocaleDateString(
                              "es-ES",
                            )
                          : "—"}
                      </div>
                      <div>
                        Total de preguntas:{" "}
                        {detailQuiz.totalQuestions ??
                          detailQuiz.questions?.length ??
                          "—"}
                      </div>
                      {(() => {
                        const s10 = scoreToTen(detailOwn?.score);
                        return s10 != null ? (
                          <div className="mt-1">
                            Tu puntaje: <b>{s10}/10</b>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="space-y-3 pb-4">
                      {(detailQuiz.questions ?? []).map((q, qIndex) => {
                        const myAnswerIndex =
                          detailOwn?.answers?.[qIndex] ?? null;
                        const correctAnswerIndex =
                          detailOwn?.correctAnswers?.[qIndex] ?? null;
                        const options = [
                          { k: 0 as const, label: "A" as const, v: q.optionA },
                          { k: 1 as const, label: "B" as const, v: q.optionB },
                          { k: 2 as const, label: "C" as const, v: q.optionC },
                          { k: 3 as const, label: "D" as const, v: q.optionD },
                        ];
                        return (
                          <div
                            key={String(q.id)}
                            className="p-3 border rounded-lg"
                          >
                            <div className="font-medium mb-2">
                              #{q.questionNumber ?? "?"} — {q.content}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {options.map((o) => {
                                const picked = myAnswerIndex === o.k;
                                const isCorrect = correctAnswerIndex === o.k;
                                const isIncorrectAnswer = picked && !isCorrect;

                                let style = "border-muted";
                                let icon = null;

                                if (isCorrect) {
                                  // Siempre mostrar la respuesta correcta en verde
                                  style =
                                    "border-green-500 bg-green-50 border-2";
                                  icon = (
                                    <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                                  );
                                } else if (isIncorrectAnswer) {
                                  // Mostrar la respuesta incorrecta seleccionada en rojo
                                  style = "border-red-500 bg-red-50 border-2";
                                  icon = (
                                    <XCircle className="h-4 w-4 text-red-600 inline ml-2" />
                                  );
                                }

                                return (
                                  <div
                                    key={o.k}
                                    className={`p-2 border rounded ${style} flex items-center justify-between`}
                                  >
                                    <span>
                                      <span className="font-semibold mr-2">
                                        {o.label}.
                                      </span>
                                      {o.v}
                                    </span>
                                    {icon}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </div>

            {/* Footer fijo al fondo */}
            {!detailLoading && !detailError && detailQuiz && (
              <div className="bg-white border-t px-6 py-4 flex justify-end gap-2 flex-shrink-0 sticky bottom-0 z-20">
                <Button variant="outline" onClick={onBack}>
                  Regresar
                </Button>
                <Button variant="ghost" onClick={closeDetail}>
                  Cerrar
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
