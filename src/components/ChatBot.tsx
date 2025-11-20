import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Send, FileText, BookOpen, MessageCircle, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ApiMessage {
  id: number;
  content: string;
  sentBy: 'STUDENT' | 'AI' | 'TEACHER' | string;
  sentAt: string;
}

interface ApiConversationSmall {
  id: number;
  title: string;
}

interface ApiConversation {
  title: string;
  messages: ApiMessage[];
  startedAt: string;
}

interface SendMessageResponse {
  id: number; // id del mensaje del alumno
  responseMessageId: number;
  response: string;
  responseSentAt: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
}

export interface ClassInfo {
  id: string;
  name: string;
  subject?: string;
  teacher?: string;
  color: string;
}

interface ChatBotProps {
  onBack: () => void;
  selectedClass: ClassInfo;
  classes: ClassInfo[];
  onClassChange: (classInfo: ClassInfo) => void;
}

const BASE = 'http://ena.ddns.net:62483';
const CONVERSATIONS_BASE = BASE;

function isLikelyJSON(text: string): any | null {
  const t = text?.trim();
  if (!t) return null;
  if (!((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']')))) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const parsedJson = !isUser ? isLikelyJSON(message.text) : null;

  const bubbleBase = 'max-w-[80%] p-3 rounded-lg break-words';
  const styles = isUser
    ? 'bg-primary text-white'
    : isSystem
      ? 'bg-yellow-50 border border-yellow-200 text-yellow-950'
      : 'bg-muted text-gray-800';

  // Renderers para ReactMarkdown (bloques de código y código inline)
  const mdComponents = {
    code({
      node,
      inline,
      className,
      children,
      ...props
    }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {inline?: boolean}) {
      const language = (className || '').replace('language-', '');
      if (inline) {
        return (
          <code className="px-1 py-[1px] rounded bg-black/10 font-mono text-[0.85em]" {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="overflow-x-auto text-sm font-mono leading-snug p-2 rounded bg-black/10" {...props}>
          <code>{children}</code>
        </pre>
      );
    },
    // Opcional: controla tamaños y márgenes de headings/listas para caber en la burbuja
    h1: (props: any) => <h1 className="text-base font-bold mt-2 mb-1" {...props} />,
    h2: (props: any) => <h2 className="text-base font-semibold mt-2 mb-1" {...props} />,
    h3: (props: any) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
    p:  (props: any) => <p className="text-sm leading-6 mb-2" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-5 my-2 space-y-1 text-sm" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-5 my-2 space-y-1 text-sm" {...props} />,
    li: (props: any) => <li className="text-sm" {...props} />,
    strong: (props: any) => <strong className="font-semibold" {...props} />,
    em: (props: any) => <em className="italic" {...props} />,
    a: ({ href, children, ...props }: any) => (
      <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:opacity-80">
        {children}
      </a>
    ),
    table: (props: any) => <div className="overflow-x-auto my-2"><table className="text-sm" {...props} /></div>,
    th: (props: any) => <th className="border px-2 py-1 bg-black/10" {...props} />,
    td: (props: any) => <td className="border px-2 py-1" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 pl-3 my-2 italic opacity-90" {...props} />
    ),
    hr: () => <hr className="my-2 border-black/10" />
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${bubbleBase} ${styles} prose prose-sm max-w-none`}>
        {/* JSON puro formateado */}
        {parsedJson ? (
          <pre className="overflow-x-auto text-sm font-mono leading-snug p-2 rounded bg-black/10">
            <code>{JSON.stringify(parsedJson, null, 2)}</code>
          </pre>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={mdComponents as any}
          >
            {message.text || ''}
          </ReactMarkdown>
        )}

        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export function ChatBot({ onBack, selectedClass, classes, onClassChange }: ChatBotProps) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<ApiConversationSmall[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [currentConvTitle, setCurrentConvTitle] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stickBottom, setStickBottom] = useState(false);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
    [token]
  );

  async function fetchJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
    const resp = await fetch(url, init);
    const ct = resp.headers.get('content-type') || '';
    if (!resp.ok) {
      let detail = '';
      try {
        if (ct.includes('application/json')) {
          const errJson = await resp.json();
          detail = errJson?.message || errJson?.error || JSON.stringify(errJson);
        } else {
          detail = (await resp.text()).slice(0, 200);
        }
      } catch {
        /* ignore */
      }
      throw new Error(`HTTP ${resp.status} ${resp.statusText}${detail ? ` - ${detail}` : ''}`);
    }
    if (!ct.includes('application/json')) {
      // Puede ser 204 o un HTML si el backend está mal roteado
      const text = await resp.text();
      throw new Error(`Respuesta no JSON del servidor (status ${resp.status}). Inicio: ${text.slice(0, 60)}`);
    }
    const json = await resp.json();
    return (json?.body ?? json) as T;
  }

  const pushSystemError = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: `sys-${Date.now()}`, text, sender: 'system', timestamp: new Date() }
    ]);
    setStickBottom(true);
  };

  useEffect(() => {
    let cancelled = false;
    async function loadList() {
      try {
        if (!selectedClass?.id) return;
        setErrorMsg(null);
        setLoadingList(true);
        setConversations([]);
        setCurrentConvId(null);
        setMessages([]);
        const rawList = await fetchJSON<any>(`${CONVERSATIONS_BASE}/conversations/classes/${selectedClass.id}`, { headers });
        const list: ApiConversationSmall[] = Array.isArray(rawList)
          ? rawList
          : Array.isArray(rawList?.data)
            ? rawList.data
            : rawList
              ? [rawList]
              : [];
        if (!cancelled) {
          setConversations(list);
          if (list.length > 0) setCurrentConvId(list[0].id);
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Error cargando conversaciones.');
          pushSystemError('No fue posible cargar la lista de conversaciones. Intenta nuevamente.');
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    loadList();
    return () => { cancelled = true; };
  }, [headers, selectedClass?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadConversation(convId: number) {
      try {
        setErrorMsg(null);
        setLoadingConv(true);
        const conv = await fetchJSON<ApiConversation>(`${CONVERSATIONS_BASE}/conversations/${convId}`, { headers });

        setCurrentConvTitle(conv.title ?? '');
        const mapped: Message[] = (conv.messages ?? []).map((m) => ({
          id: String(m.id),
          text: m.content,
          sender: m.sentBy === 'STUDENT' ? 'user' : 'bot',
          timestamp: new Date(m.sentAt),
        }));

        if (!cancelled) {
          setMessages(mapped);
          setStickBottom(true); // Activar stickBottom para ir al final
          // Scroll al final cuando se carga la conversación
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
            // También usar endRef para asegurar que se vea el final
            setTimeout(() => {
              endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Error cargando conversación.');
          pushSystemError('No pudimos cargar los mensajes de la conversación seleccionada.');
        }
      } finally {
        if (!cancelled) setLoadingConv(false);
      }
    }
    if (token && currentConvId) loadConversation(currentConvId);
    return () => { cancelled = true; };
  }, [headers, token, currentConvId]);

  useEffect(() => {
    if (stickBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping, stickBottom]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentConvId) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setStickBottom(true);
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await fetchJSON<SendMessageResponse>(
        `${CONVERSATIONS_BASE}/conversations/${currentConvId}/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ content: userMessage.text })
        }
      );

      const botMessage: Message = {
        id: `b-${data.responseMessageId}`,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(data.responseSentAt)
      };

      setMessages(prev => [...prev, botMessage]);
      setStickBottom(true);
    } catch (e: any) {
      console.error('Error enviando mensaje:', e);
      pushSystemError('Hubo un problema enviando tu mensaje. Intenta nuevamente.');
      setErrorMsg(e?.message || 'Error enviando mensaje.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newTitle.trim()) return;
    try {
      setErrorMsg(null);
      setCreating(true);
      const created = await fetchJSON<{ id: number }>(
        `${CONVERSATIONS_BASE}/conversations/classes/${selectedClass.id}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ title: newTitle.trim() })
        }
      );
      const { id } = created;
      setNewTitle('');

      const rawList = await fetchJSON<any>(`${CONVERSATIONS_BASE}/conversations/classes/${selectedClass.id}`, { headers });
      const list: ApiConversationSmall[] = Array.isArray(rawList)
        ? rawList
        : Array.isArray(rawList?.data)
          ? rawList.data
          : rawList
            ? [rawList]
            : [];
      setConversations(list);
      setCurrentConvId(id);
    } catch (e: any) {
      console.error('Error creando conversación:', e);
      setErrorMsg(e?.message || 'Error creando conversación.');
      pushSystemError('No pudimos crear la conversación. Revisa el título e inténtalo de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const availableMaterials = [
    'Material de la clase (PDFs/PPT)',
    'Apuntes del profesor',
    'Enunciados de ejercicios'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">KumoChat</h1>
            </div>
          </div>

          <Select
            value={selectedClass?.id}
            onValueChange={(value) => {
              const classInfo = classes.find(c => c.id === value);
              if (classInfo) onClassChange(classInfo);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona clase" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classInfo) => (
                <SelectItem key={classInfo.id} value={classInfo.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: classInfo.color }} />
                    <span className="font-medium">
                      {classInfo.name} <span className="text-xs opacity-70">(ID: {classInfo.id})</span>
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Banner de error global */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{errorMsg}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Conversaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Título nueva conversación"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={creating}
                  />
                  <Button onClick={handleCreateConversation} disabled={creating || !newTitle.trim()}>
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlusCircle className="h-4 w-4 mr-1" /> Crear</>}
                  </Button>
                </div>

                {loadingList ? (
                  <p className="text-sm text-gray-500">Cargando conversaciones…</p>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes conversaciones. ¡Crea una! 👆</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCurrentConvId(c.id)}
                        className={`w-full text-left p-3 rounded-lg border hover:bg-accent/60 transition-colors ${
                          c.id === currentConvId ? 'bg-accent/70 border-primary' : 'bg-accent/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{c.title || `Conv. ${c.id}`}</span>
                          {c.id === currentConvId && <Badge variant="secondary" className="text-xs">Activa</Badge>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Material Disponible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableMaterials.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-accent/50 border flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm">{m}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <Card className="lg:col-span-3 bg-white/90 backdrop-blur">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {currentConvTitle ? currentConvTitle : currentConvId ? `Conversación #${currentConvId}` : '—'}
                </CardTitle>
                {selectedClass?.name && (
                  <div className="text-sm text-muted-foreground">
                    {selectedClass.name}{selectedClass.subject ? ` — ${selectedClass.subject}` : ''} (ID: {selectedClass.id})
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px]">
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
                  {loadingConv && (
                    <p className="text-sm text-gray-500">Cargando mensajes…</p>
                  )}
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-gray-800 p-3 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={endRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu pregunta aquí..."
                      className="flex-1"
                      disabled={isTyping || !currentConvId}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isTyping || !inputText.trim() || !currentConvId}
                      size="icon"
                      title={!currentConvId ? 'Crea o selecciona una conversación' : 'Enviar'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {!currentConvId && (
                    <p className="text-xs text-gray-500 mt-2">Crea o selecciona una conversación para comenzar.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
