export interface InventoryItem {
  id: string | number;
  itemId: string | number;
  name: string;
  description?: string;
  type?: string;
  imageUrl?: string;
  quantity?: number;
  equipped?: boolean;
  acquiredDate?: string;
}
