export interface ImageFile {
  file: File;
  preview: string;
}

export interface AspectRatio {
  label: string;
  value: '1:1' | '9:16' | '16:9' | '3:4' | '4:3';
}

export interface Font {
  label: string;
  value: string; // A descriptive value for the AI
}
