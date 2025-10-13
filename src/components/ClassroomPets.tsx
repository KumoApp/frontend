import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, Users, Trophy, Star, Crown } from 'lucide-react';

interface ClassmatePet {
  id: string;
  studentName: string;
  petName: string;
  petColor: string;
  petAccessories: string[];
  level: number;
  kumoSoles: number;
  streak: number;
  rank: number;
}

interface ClassroomPetsProps {
  onBack: () => void;
}

export function ClassroomPets({ onBack }: ClassroomPetsProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'top' | 'friends'>('all');

  // Mock data for classroom pets
  const classmatePets: ClassmatePet[] = [
    {
      id: '1',
      studentName: 'Ana García',
      petName: 'Kumo',
      petColor: '#8DBCC7',
      petAccessories: ['👓', '🎓'],
      level: 8,
      kumoSoles: 1250,
      streak: 5,
      rank: 3
    },
    {
      id: '2',
      studentName: 'Carlos Mendoza',
      petName: 'Thunder',
      petColor: '#FFD700',
      petAccessories: ['👑', '🏅'],
      level: 12,
      kumoSoles: 2100,
      streak: 12,
      rank: 1
    },
    {
      id: '3',
      studentName: 'María López',
      petName: 'Luna',
      petColor: '#C4E1E6',
      petAccessories: ['🧣', '⭐'],
      level: 10,
      kumoSoles: 1850,
      streak: 8,
      rank: 2
    },
    {
      id: '4',
      studentName: 'Diego Ruiz',
      petName: 'Sparky',
      petColor: '#A4CCD9',
      petAccessories: ['👔'],
      level: 7,
      kumoSoles: 980,
      streak: 3,
      rank: 5
    },
    {
      id: '5',
      studentName: 'Sofia Chen',
      petName: 'Mochi',
      petColor: '#EBFFD8',
      petAccessories: ['🎀', '👓'],
      level: 9,
      kumoSoles: 1400,
      streak: 6,
      rank: 4
    },
    {
      id: '6',
      studentName: 'Alejandro Torres',
      petName: 'Rocky',
      petColor: '#8B4513',
      petAccessories: ['🏆'],
      level: 6,
      kumoSoles: 850,
      streak: 2,
      rank: 6
    },
    {
      id: '7',
      studentName: 'Isabella Morales',
      petName: 'Nube',
      petColor: '#E6E6FA',
      petAccessories: ['🌟', '🎓'],
      level: 8,
      kumoSoles: 1180,
      streak: 4,
      rank: 7
    },
    {
      id: '8',
      studentName: 'Gabriel Santos',
      petName: 'Flash',
      petColor: '#FF6347',
      petAccessories: ['⚡', '🥇'],
      level: 11,
      kumoSoles: 1950,
      streak: 9,
      rank: 8
    }
  ];

  const filteredPets = classmatePets
    .filter(pet => {
      if (selectedFilter === 'top') return pet.rank <= 3;
      if (selectedFilter === 'friends') return ['Carlos Mendoza', 'María López', 'Sofia Chen'].includes(pet.studentName);
      return true;
    })
    .sort((a, b) => a.rank - b.rank);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Star className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">1° Lugar</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-500">2° Lugar</Badge>;
    if (rank === 3) return <Badge className="bg-orange-500 hover:bg-orange-600">3° Lugar</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Mascotas del Salón</h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            size="sm"
          >
            Todos ({classmatePets.length})
          </Button>
          <Button
            variant={selectedFilter === 'top' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('top')}
            size="sm"
          >
            Top 3
          </Button>
          <Button
            variant={selectedFilter === 'friends' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('friends')}
            size="sm"
          >
            Amigos (3)
          </Button>
        </div>

        {/* Top 3 Highlight */}
        {selectedFilter === 'all' && (
          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Trophy className="h-5 w-5" />
                Podio de la Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {filteredPets.slice(0, 3).map((pet, index) => (
                  <div key={pet.id} className="text-center">
                    <div className="relative mb-2">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto border-4 border-white shadow-lg"
                        style={{ backgroundColor: pet.petColor }}
                      >
                        🐱
                      </div>
                      <div className="absolute -top-2 -right-2">
                        {getRankIcon(pet.rank)}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex gap-1">
                          {pet.petAccessories.map((acc, i) => (
                            <span key={i} className="text-lg">{acc}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="font-medium text-sm">{pet.petName}</p>
                    <p className="text-xs text-gray-600">{pet.studentName}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {getRankBadge(pet.rank)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pet Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="bg-white/90 backdrop-blur hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {pet.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{pet.studentName}</p>
                      <p className="text-xs text-gray-600">Nivel {pet.level}</p>
                    </div>
                  </div>
                  {getRankIcon(pet.rank)}
                </div>

                <div className="text-center mb-3">
                  <div className="relative mx-auto mb-2">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto border-3 border-white shadow-md"
                      style={{ backgroundColor: pet.petColor }}
                    >
                      🐱
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {pet.petAccessories.map((acc, i) => (
                          <span key={i} className="text-sm">{acc}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="font-medium">{pet.petName}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">KumoSoles:</span>
                    <span className="font-medium text-yellow-600">{pet.kumoSoles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Racha:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{pet.streak} días</span>
                      {pet.streak >= 3 && <Badge variant="secondary" className="text-xs px-1">x1.25</Badge>}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ranking:</span>
                    {getRankBadge(pet.rank)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPets.length === 0 && (
          <Card className="bg-white/90 backdrop-blur text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron mascotas con los filtros seleccionados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}