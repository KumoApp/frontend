export interface Pet {
  id: string | number;
  name: string;
  type: string; // e.g., "DOG", "CAT"
  level?: number;
  experience?: number;
  hunger?: number;
  happiness?: number;
  health?: number;
  imageUrl?: string;
  color?: string;
  equippedItems?: Array<{
    id: string | number;
    name: string;
    type?: string;
  }>;
  classId?: string | number;
  ownerId?: string | number;
}

export interface CreatePetData {
  name: string;
  type: string;
}

export interface FeedPetResponse {
  success: boolean;
  message?: string;
  pet?: Pet;
}

export interface EquipItemResponse {
  success: boolean;
  message?: string;
  pet?: Pet;
}
