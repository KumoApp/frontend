// Material info from GetMaterialFromClass endpoint
export interface MaterialInfo {
  id: number;
  name: string;
  uploadedAt: string;
}

// Response from GetMaterialFromClass
export interface GetMaterialFromClassResponse {
  code: number;
  message: string;
  body: MaterialInfo[];
}

// For backward compatibility
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
