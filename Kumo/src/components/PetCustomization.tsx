import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Sparkles, ShoppingCart, Palette } from 'lucide-react';

interface PetCustomizationProps {
  onBack: () => void;
  studentData: {
    kumoSoles: number;
    petName: string;
    petColor: string;
    petAccessories: string[];
  };
  onCustomize: (newColor: string, newAccessories: string[]) => void;
}

interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: 'color' | 'accessory';
  value: string;
  emoji: string;
  description: string;
  owned?: boolean;
}

export function PetCustomization({ onBack, studentData, onCustomize }: PetCustomizationProps) {
  const [selectedColor, setSelectedColor] = useState(studentData.petColor);
  const [selectedAccessories, setSelectedAccessories] = useState(studentData.petAccessories);
  const [kumoSoles, setKumoSoles] = useState(studentData.kumoSoles);

  const shopItems: ShopItem[] = [
    // Colors
    {
      id: 'color_blue',
      name: 'Azul Océano',
      price: 150,
      type: 'color',
      value: '#8DBCC7',
      emoji: '🔵',
      description: 'Un hermoso color azul como el océano',
      owned: studentData.petColor === '#8DBCC7'
    },
    {
      id: 'color_green',
      name: 'Verde Bosque',
      price: 150,
      type: 'color',
      value: '#A4CCD9',
      emoji: '🟢',
      description: 'Un verde fresco como el bosque',
      owned: studentData.petColor === '#A4CCD9'
    },
    {
      id: 'color_purple',
      name: 'Púrpura Mágico',
      price: 200,
      type: 'color',
      value: '#C4E1E6',
      emoji: '🟣',
      description: 'Un color púrpura lleno de magia',
      owned: studentData.petColor === '#C4E1E6'
    },
    {
      id: 'color_gold',
      name: 'Dorado Real',
      price: 300,
      type: 'color',
      value: '#FFD700',
      emoji: '🟡',
      description: 'El color de la realeza',
      owned: studentData.petColor === '#FFD700'
    },
    // Accessories
    {
      id: 'acc_glasses',
      name: 'Gafas de Estudio',
      price: 100,
      type: 'accessory',
      value: 'gafas',
      emoji: '👓',
      description: 'Para verse más inteligente',
      owned: studentData.petAccessories.includes('gafas')
    },
    {
      id: 'acc_hat',
      name: 'Sombrero Académico',
      price: 120,
      type: 'accessory',
      value: 'sombrero',
      emoji: '🎓',
      description: 'El sombrero de los graduados',
      owned: studentData.petAccessories.includes('sombrero')
    },
    {
      id: 'acc_bow',
      name: 'Corbata Elegante',
      price: 80,
      type: 'accessory',
      value: 'corbata',
      emoji: '👔',
      description: 'Para ocasiones especiales',
      owned: studentData.petAccessories.includes('corbata')
    },
    {
      id: 'acc_crown',
      name: 'Corona de Campeón',
      price: 250,
      type: 'accessory',
      value: 'corona',
      emoji: '👑',
      description: 'Para los mejores estudiantes',
      owned: studentData.petAccessories.includes('corona')
    },
    {
      id: 'acc_scarf',
      name: 'Bufanda Invernal',
      price: 90,
      type: 'accessory',
      value: 'bufanda',
      emoji: '🧣',
      description: 'Para mantenerse calentito',
      owned: studentData.petAccessories.includes('bufanda')
    },
    {
      id: 'acc_medal',
      name: 'Medalla de Honor',
      price: 200,
      type: 'accessory',
      value: 'medalla',
      emoji: '🏅',
      description: 'Por logros excepcionales',
      owned: studentData.petAccessories.includes('medalla')
    }
  ];

  const handlePurchase = (item: ShopItem) => {
    if (kumoSoles >= item.price && !item.owned) {
      setKumoSoles(prev => prev - item.price);
      
      if (item.type === 'color') {
        setSelectedColor(item.value);
      } else {
        setSelectedAccessories(prev => [...prev, item.value]);
      }

      // Mark item as owned
      item.owned = true;
    }
  };

  const handleAccessoryToggle = (accessory: string) => {
    setSelectedAccessories(prev => {
      if (prev.includes(accessory)) {
        return prev.filter(acc => acc !== accessory);
      } else {
        return [...prev, accessory];
      }
    });
  };

  const handleSaveChanges = () => {
    onCustomize(selectedColor, selectedAccessories);
    onBack();
  };

  const getAccessoryEmoji = (accessory: string) => {
    const item = shopItems.find(item => item.value === accessory);
    return item?.emoji || '';
  };

  const colorItems = shopItems.filter(item => item.type === 'color');
  const accessoryItems = shopItems.filter(item => item.type === 'accessory');

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
              <Palette className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Personalizar Mascota</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">{kumoSoles} KumoSoles</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pet Preview */}
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-center">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative mx-auto mb-4 w-32 h-32">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-6xl border-4 border-white shadow-lg"
                  style={{ backgroundColor: selectedColor }}
                >
                  🐱
                </div>
                {/* Accessories overlay */}
                {selectedAccessories.map((accessory) => {
                  // Position each accessory type differently
                  let position = {};
                  if (accessory === 'gafas') {
                    position = { top: '32%', left: '50%', transform: 'translateX(-50%)' };
                  } else if (accessory === 'sombrero') {
                    position = { top: '-5%', left: '50%', transform: 'translateX(-50%)' };
                  } else if (accessory === 'corbata') {
                    position = { bottom: '20%', left: '50%', transform: 'translateX(-50%)' };
                  } else if (accessory === 'corona') {
                    position = { top: '-8%', left: '50%', transform: 'translateX(-50%)' };
                  } else if (accessory === 'bufanda') {
                    position = { bottom: '25%', left: '50%', transform: 'translateX(-50%)' };
                  } else if (accessory === 'medalla') {
                    position = { bottom: '15%', left: '50%', transform: 'translateX(-50%)' };
                  }
                  
                  return (
                    <span
                      key={accessory}
                      className="absolute text-3xl"
                      style={position}
                    >
                      {getAccessoryEmoji(accessory)}
                    </span>
                  );
                })}
              </div>
              <h3 className="font-medium text-lg">{studentData.petName}</h3>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {selectedAccessories.map(accessory => (
                  <Badge key={accessory} variant="secondary" className="text-xs">
                    {getAccessoryEmoji(accessory)} {accessory}
                  </Badge>
                ))}
              </div>
              <Button 
                onClick={handleSaveChanges}
                className="w-full mt-4"
                disabled={selectedColor === studentData.petColor && 
                         selectedAccessories.length === studentData.petAccessories.length &&
                         selectedAccessories.every(acc => studentData.petAccessories.includes(acc))}
              >
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          {/* Color Shop */}
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {colorItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedColor === item.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => item.owned && setSelectedColor(item.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: item.value }}
                        ></div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.owned ? (
                          <Badge variant="secondary" className="text-xs">Disponible</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(item);
                            }}
                            disabled={kumoSoles < item.price}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {item.price}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Accessories Shop */}
          <Card className="bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Accesorios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {accessoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAccessories.includes(item.value) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => item.owned && handleAccessoryToggle(item.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.owned ? (
                          <Badge 
                            variant={selectedAccessories.includes(item.value) ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {selectedAccessories.includes(item.value) ? 'Equipado' : 'Disponible'}
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(item);
                            }}
                            disabled={kumoSoles < item.price}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {item.price}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}