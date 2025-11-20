import React from "react";

const API_BASE_URL = "http://ena.ddns.net:62483";

interface EquippedItem {
  id: string | number;
  name: string;
  imageUrl?: string;
  category?: string;
  type?: string;
}

interface PetAvatarProps {
  petType?: string;
  petImageUrl?: string;
  equippedItems?: EquippedItem[];
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function PetAvatar({
  petType = "DOG",
  petImageUrl,
  equippedItems = [],
  size = "md",
  className = "",
}: PetAvatarProps) {
  const getPetEmoji = (type: string) => {
    const petTypes: { [key: string]: string } = {
      CAT: "🐱",
      DOG: "🐕",
      BIRD: "🐦",
      TURTLE: "🐢",
      RABBIT: "🐰",
      DUCK: "🦆",
      HAMSTER: "🐹",
      UNICORN: "🦄",
    };
    return petTypes[type] || "🐾";
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-4xl",
    md: "w-24 h-24 text-6xl",
    lg: "w-32 h-32 text-8xl",
    xl: "w-40 h-40 text-9xl",
  };

  const accessorySizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const getAccessoryPosition = (category?: string, type?: string) => {
    const cat = (category || type || "").toLowerCase();

    // Posiciones para diferentes tipos de accesorios
    if (
      cat.includes("hat") ||
      cat.includes("sombrero") ||
      cat.includes("crown") ||
      cat.includes("corona")
    ) {
      return { top: "-10%", left: "50%", transform: "translateX(-50%)" };
    }
    if (cat.includes("glasses") || cat.includes("gafas")) {
      return { top: "30%", left: "50%", transform: "translateX(-50%)" };
    }
    if (
      cat.includes("scarf") ||
      cat.includes("bufanda") ||
      cat.includes("collar")
    ) {
      return { bottom: "30%", left: "50%", transform: "translateX(-50%)" };
    }
    if (cat.includes("bow") || cat.includes("tie") || cat.includes("corbata")) {
      return { bottom: "25%", left: "50%", transform: "translateX(-50%)" };
    }
    if (cat.includes("medal") || cat.includes("medalla")) {
      return { bottom: "20%", left: "50%", transform: "translateX(-50%)" };
    }
    if (cat.includes("wings") || cat.includes("alas")) {
      return { top: "40%", left: "50%", transform: "translateX(-50%)" };
    }

    // Posición por defecto (arriba)
    return { top: "0%", left: "50%", transform: "translateX(-50%)" };
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Mascota base */}
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        {petImageUrl ? (
          <img
            src={
              petImageUrl.startsWith("http")
                ? petImageUrl
                : `${API_BASE_URL}/${petImageUrl}`
            }
            alt="Pet"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Si falla la imagen, mostrar emoji
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = getPetEmoji(petType);
              }
            }}
          />
        ) : (
          <span className={accessorySizes[size]}>{getPetEmoji(petType)}</span>
        )}
      </div>

      {/* Items equipados como overlay */}
      {equippedItems.map((item, index) => {
        const position = getAccessoryPosition(item.category, item.type);

        return (
          <div
            key={item.id || index}
            className={`absolute ${accessorySizes[size]} pointer-events-none`}
            style={position}
            title={item.name}
          >
            {item.imageUrl ? (
              <img
                src={
                  item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : `${API_BASE_URL}/${item.imageUrl}`
                }
                alt={item.name}
                className="w-full h-full object-contain drop-shadow-lg"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              // Si no hay imagen, podríamos mostrar un emoji o ícono por defecto
              <span className="drop-shadow-lg">✨</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
