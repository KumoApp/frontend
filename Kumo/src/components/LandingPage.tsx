import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BookOpen, Users, Trophy, Sparkles, MessageCircle, BarChart3 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: 'Chat Inteligente',
      description: 'Haz preguntas sobre tu material de clase y recibe respuestas instantáneas para entender mejor.'
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      title: 'Quizzes Gamificados',
      description: 'Completa quizzes diarios y gana KumoSoles. Mantén rachas para multiplicar tus recompensas.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-500" />,
      title: 'Mascotas Virtuales',
      description: 'Personaliza tu mascota virtual usando los KumoSoles que ganas. ¡Compite con tus compañeros!'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-500" />,
      title: 'Progreso Visual',
      description: 'Observa tu progreso en tiempo real y ve cómo mejoras día a día.'
    },
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      title: 'Material Accesible',
      description: 'Accede a todo el material de clase desde un solo lugar, cuando lo necesites.'
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: 'Salón Colaborativo',
      description: 'Comparte tu progreso con tus compañeros y motívense mutuamente.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-muted to-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl mb-6 shadow-2xl">
                <span className="text-4xl">🐱</span>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                Kumo
              </h1>
              <p className="text-2xl text-gray-700 mb-8">
                Aprende Jugando
              </p>
            </div>

            {/* Subtitle */}
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-xl text-gray-600 leading-relaxed">
                Aprende de manera divertida con 
                <span className="font-semibold text-primary"> quizzes gamificados</span>, 
                <span className="font-semibold text-secondary"> mascotas virtuales</span> y 
                <span className="font-semibold text-accent-foreground"> un chatbot inteligente </span> 
                que te ayuda a entender mejor tus clases. ¡Gana KumoSoles y mantén tu racha!
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-16">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Comenzar Ahora
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-foreground/10 rounded-full blur-xl"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¿Cómo funciona Kumo?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre todas las herramientas que Kumo tiene para hacer tu aprendizaje 
            más efectivo y entretenido.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">Estudiantes Motivados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">3x</div>
              <div className="text-gray-600">Mejora en Retención</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">50+</div>
              <div className="text-gray-600">Escuelas Usando Kumo</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">24/7</div>
              <div className="text-gray-600">Ayuda Disponible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para mejorar tus calificaciones?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de estudiantes que ya están aprendiendo de forma más divertida 
            y efectiva con Kumo. ¡Gana recompensas mientras estudias!
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-4 bg-white text-primary hover:bg-gray-100 shadow-lg"
          >
            Comenzar Ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
