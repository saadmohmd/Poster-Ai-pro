import { AspectRatio, Font } from './types';

export const ASPECT_RATIOS: AspectRatio[] = [
  { label: 'Portrait (9:16)', value: '9:16' },
  { label: 'Square (1:1)', value: '1:1' },
  { label: 'Landscape (16:9)', value: '16:9' },
  { label: 'Standard (3:4)', value: '3:4' },
  { label: 'Wide (4:3)', value: '4:3' },
];

export const FONTS: Font[] = [
  { label: 'Default', value: 'a clean and readable font' },
  { label: 'Modern Sans-Serif', value: 'a modern, clean, minimalist sans-serif font like Helvetica or Futura' },
  { label: 'Elegant Serif', value: 'an elegant, classic serif font like Times New Roman or Garamond' },
  { label: 'Playful Script', value: 'a casual, playful script or handwritten font' },
  { label: 'Bold Display', value: 'a bold, impactful display font suitable for headlines' },
  { label: 'Futuristic Tech', value: 'a futuristic, digital, or sci-fi style font' },
];
