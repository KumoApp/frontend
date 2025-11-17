export interface Material {
  id: string | number;
  name: string;
  type?: string;
  uploadDate?: string;
  classId?: string | number;
  url?: string;
  size?: string;
  downloads?: number;
}

export interface MaterialUploadResponse {
  id: string | number;
  name: string;
  url?: string;
  message?: string;
}
