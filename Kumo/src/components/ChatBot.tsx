import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Send, FileText, BookOpen, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  relatedMaterial?: string;
}

interface ChatBotProps {
  onBack: () => void;
}

export function ChatBot({ onBack }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de aprendizaje. Puedo ayudarte con cualquier pregunta sobre el material de clase. ¿En qué tema te gustaría que te ayude hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Mock data for available materials
  const availableMaterials = [
    'Matemáticas - Álgebra Lineal',
    'Historia - Segunda Guerra Mundial',
    'Ciencias - Sistema Solar',
    'Literatura - Don Quijote',
    'Química - Tabla Periódica'
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        relatedMaterial: botResponse.material
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): { text: string; material?: string } => {
    const input = userInput.toLowerCase();

    if (input.includes('matemáticas') || input.includes('algebra') || input.includes('ecuación')) {
      return {
        text: 'Claro, puedo ayudarte con matemáticas. Según el material de "Álgebra Lineal" que subió tu profesor, las ecuaciones lineales se resuelven despejando la variable. ¿Te gustaría que repasemos algún ejercicio específico?',
        material: 'Matemáticas - Álgebra Lineal'
      };
    }

    if (input.includes('historia') || input.includes('guerra') || input.includes('mundial')) {
      return {
        text: 'En el material sobre la Segunda Guerra Mundial, tu profesor explica que comenzó en 1939 con la invasión de Polonia. Los principales países involucrados fueron las Potencias del Eje y los Aliados. ¿Qué aspecto específico te interesa más?',
        material: 'Historia - Segunda Guerra Mundial'
      };
    }

    if (input.includes('ciencias') || input.includes('planeta') || input.includes('solar')) {
      return {
        text: 'El sistema solar tiene 8 planetas principales. Según los apuntes de tu profesor, Mercurio es el más cercano al Sol y Neptuno el más lejano. ¿Te gustaría saber más sobre algún planeta en particular?',
        material: 'Ciencias - Sistema Solar'
      };
    }

    if (input.includes('quiz') || input.includes('examen') || input.includes('evaluación')) {
      return {
        text: 'Los quizzes diarios están basados en todo el material que ha subido tu profesor. Te recomiendo repasar los temas más recientes. ¿Necesitas ayuda para prepararte para algún tema específico?'
      };
    }

    // Default response
    return {
      text: 'Puedo ayudarte con cualquiera de estos temas disponibles: Matemáticas, Historia, Ciencias, Literatura y Química. También puedo responder preguntas sobre los quizzes diarios. ¿Sobre qué te gustaría aprender?'
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Asistente de Aprendizaje</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar with available materials */}
          <Card className="lg:col-span-1 bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Material Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableMaterials.map((material, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-accent/50 border cursor-pointer hover:bg-accent/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm">{material}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 bg-white/90 backdrop-blur">
            <CardContent className="p-0">
              <div className="flex flex-col h-[600px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
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
                          <p className="text-sm">{message.text}</p>
                          {message.relatedMaterial && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              📚 {message.relatedMaterial}
                            </Badge>
                          )}
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
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isTyping || !inputText.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Presiona Enter para enviar o Shift+Enter para nueva línea
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}