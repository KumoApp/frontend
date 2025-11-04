import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Send, FileText, BookOpen, MessageCircle, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ClassInfo {
  id: string;     // debe mapear al classId que tu backend espera
  name: string;
  teacher: string;
  color: string;
}

interface ChatBotProps {
  onBack: () => void;
  selectedClass: ClassInfo;
  classes: ClassInfo[];
  onClassChange: (classInfo: ClassInfo) => void;
}

const BASE = 'http://localhost:3000';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
    [token]
  );

  // Cargar conversaciones de la clase
  useEffect(() => {
    let cancelled = false;
    async function loadList() {
      try {
        setLoadingList(true);
        setConversations([]);
        setCurrentConvId(null);
        setMessages([]);
        const resp = await fetch(`${BASE}/conversations/classes/${selectedClass.id}`, {
          headers
        });
        const json = await resp.json();
        // DTO { code, message, body }
        const list: ApiConversationSmall[] = json?.body ?? json ?? [];
        if (!cancelled) {
          setConversations(list);
          if (list.length > 0) {
            setCurrentConvId(list[0].id);
          }
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    if (token && selectedClass?.id) loadList();
    return () => { cancelled = true; };
  }, [headers, selectedClass?.id, token]);

  // Cuando cambia currentConvId, cargar historial
  useEffect(() => {
    let cancelled = false;
    async function loadConversation(convId: number) {
      try {
        setLoadingConv(true);
        const resp = await fetch(`${BASE}/conversations/${convId}`, { headers });
        const json = await resp.json();
        const conv: ApiConversation = json?.body ?? json;

        setCurrentConvTitle(conv.title ?? '');
        const mapped: Message[] = (conv.messages ?? []).map((m) => ({
          id: String(m.id),
          text: m.content,
          sender: m.sentBy === 'STUDENT' ? 'user' : 'bot',
          timestamp: new Date(m.sentAt),
        }));
        if (!cancelled) setMessages(mapped);
      } finally {
        if (!cancelled) setLoadingConv(false);
      }
    }
    if (token && currentConvId) loadConversation(currentConvId);
    return () => { cancelled = true; };
  }, [headers, token, currentConvId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentConvId) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const resp = await fetch(`${BASE}/conversations/${currentConvId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: userMessage.text })
      });
      const json = await resp.json();
      const data: SendMessageResponse = json?.body ?? json;

      const botMessage: Message = {
        id: `b-${data.responseMessageId}`,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(data.responseSentAt)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error('Error enviando mensaje:', e);
      // fallback de error en chat
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          text: 'Hubo un problema enviando tu mensaje. Intenta nuevamente.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const resp = await fetch(`${BASE}/conversations/classes/${selectedClass.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: newTitle.trim() })
      });
      const json = await resp.json();
      const { id } = json?.body ?? json; // { id: number }
      setNewTitle('');
      // refrescar lista y seleccionar la nueva
      const listResp = await fetch(`${BASE}/conversations/classes/${selectedClass.id}`, { headers });
      const listJson = await listResp.json();
      const list: ApiConversationSmall[] = listJson?.body ?? listJson ?? [];
      setConversations(list);
      setCurrentConvId(id);
    } catch (e) {
      console.error('Error creando conversación:', e);
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

  // (Opcional) lista lateral de materiales; puedes reemplazarlo con tu /materials
  const availableMaterials = [
    'Material de la clase (PDFs/PPT)',
    'Apuntes del profesor',
    'Enunciados de ejercicios'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            value={selectedClass.id}
            onValueChange={(value) => {
              const classInfo = classes.find(c => c.id === value);
              if (classInfo) onClassChange(classInfo);
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classInfo) => (
                <SelectItem key={classInfo.id} value={classInfo.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: classInfo.color }} />
                    {classInfo.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar: Conversaciones + Material */}
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
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px]">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  {loadingConv && (
                    <p className="text-sm text-gray-500">Cargando mensajes…</p>
                  )}
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-muted text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
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
                  </div>
                </ScrollArea>

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
