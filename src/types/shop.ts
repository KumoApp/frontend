export interface ShopItem {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  type?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
}

export interface PurchaseResponse {
  success: boolean;
  message?: string;
  item?: ShopItem;
  newBalance?: number;
}
