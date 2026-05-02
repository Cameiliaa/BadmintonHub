export interface User {
  id: string;
  name: string;
  photoURL?: string;
}

export type LayoutType = 'single' | 'grid-2' | 'grid-3-v' | 'grid-4';

export interface LayoutConfig {
  id: LayoutType;
  name: string;
  cols: number;
  rows: number;
  aspectRatio: number; // width / height
}

export const LAYOUTS: LayoutConfig[] = [
  { id: 'single', name: 'Single', cols: 1, rows: 1, aspectRatio: 3/4 },
  { id: 'grid-2', name: '2 Grid', cols: 1, rows: 2, aspectRatio: 3/4 },
  { id: 'grid-3-v', name: '3 Vertical', cols: 1, rows: 3, aspectRatio: 3/4 },
  { id: 'grid-4', name: 'Classic 4', cols: 2, rows: 2, aspectRatio: 3/4 },
];

export interface Room {
  id: string;
  name: string;
  hostId: string;
  status: 'waiting' | 'countdown' | 'capturing' | 'completed';
  currentLayout: LayoutType;
  participants: string[]; // User IDs
  createdAt: number;
  countdownStart?: number;
  capturedPhotos: Record<string, string[]>; // userId -> dataURLs
}

export interface Template {
  id: string;
  name: string;
  overlayImageUrl: string;
  layout: LayoutType;
  backgroundColor: string;
}

export interface Sticker {
  id: string;
  name: string;
  url: string;
  category: string;
}

export interface PhotoFilter {
  name: string;
  filter: string; // CSS filter string
}

export const FILTERS: PhotoFilter[] = [
  { name: 'None', filter: 'none' },
  { name: 'Grayscale', filter: 'grayscale(100%)' },
  { name: 'Sepia', filter: 'sepia(100%)' },
  { name: 'Vintage', filter: 'sepia(50%) contrast(120%) brightness(90%)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) brightness(1.1)' },
  { name: 'Warm', filter: 'sepia(30%) saturate(150%) brightness(1.1)' },
  { name: 'Invert', filter: 'invert(100%)' },
];
