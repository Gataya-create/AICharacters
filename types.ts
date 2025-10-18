
export interface Character {
  id: string;
  name: string;
  imageUrl: string; // base64 data URL
  mimeType: string;
}

export interface Background {
  id: string;
  name: string;
  imageUrl: string; // base64 data URL
  mimeType: string;
}

export type AspectRatio = '9:16' | '16:9' | '1:1';
