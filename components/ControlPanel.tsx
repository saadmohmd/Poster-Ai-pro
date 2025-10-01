import React, { useRef, useState } from 'react';
import { ImageFile, AspectRatio, Font } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { UploadIcon } from './icons/UploadIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { ASPECT_RATIOS, FONTS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';

interface MultiFileInputProps {
  onAddFiles: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  selectedFiles: ImageFile[];
  label: string;
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({ onAddFiles, onRemoveFile, selectedFiles, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddFiles(e.target.files);
    }
    if (inputRef.current) {
        inputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onAddFiles(files);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {selectedFiles.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
              {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                      <img src={file.preview} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
                      <button 
                        onClick={() => onRemoveFile(index)}
                        className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                          <TrashIcon className="w-4 h-4" />
                      </button>
                  </div>
              ))}
          </div>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`mt-1 flex justify-center px-6 py-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDraggingOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-indigo-500'}`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-10 w-10 text-gray-500" />
          <div className="flex text-sm text-gray-400">
            <p className="pl-1">{isDraggingOver ? 'Drop files to upload' : selectedFiles.length > 0 ? 'Click or drag to add more' : 'Click or drag to upload'}</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};

interface ControlPanelProps {
  onAddProductImages: (files: FileList) => void;
  onRemoveProductImage: (index: number) => void;
  onAddReferenceImages: (files: FileList) => void;
  onRemoveReferenceImage: (index: number) => void;
  productImages: ImageFile[];
  referenceImages: ImageFile[];
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  concept: string;
  onConceptChange: (concept: string) => void;
  backgroundConcept: string;
  onBackgroundConceptChange: (concept: string) => void;
  posterText: string;
  onPosterTextChange: (text: string) => void;
  selectedFont: Font;
  onFontChange: (font: Font) => void;
  onGeneratePoster: () => void;
  isGeneratingPoster: boolean;
  processedImagesExist: boolean;
  onGetSuggestions: () => void;
  isGettingSuggestions: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddProductImages, onRemoveProductImage, onAddReferenceImages, onRemoveReferenceImage,
  productImages, referenceImages, aspectRatio, onAspectRatioChange, concept, onConceptChange,
  backgroundConcept, onBackgroundConceptChange, posterText, onPosterTextChange, selectedFont, onFontChange,
  onGeneratePoster, isGeneratingPoster, processedImagesExist,
  onGetSuggestions, isGettingSuggestions
}) => {
  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
      <Card title="Step 1: Upload Products">
        <MultiFileInput 
          onAddFiles={onAddProductImages} 
          onRemoveFile={onRemoveProductImage}
          selectedFiles={productImages} 
          label="Product Image(s)" 
        />
        <p className="text-xs text-gray-400 mt-2 text-center">Background will be removed automatically.</p>
      </Card>
      
      <Card title="Step 2: Define Concept">
        <div className="space-y-4">
          <div>
              <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
              <select
                id="aspect-ratio"
                value={aspectRatio.value}
                onChange={(e) => onAspectRatioChange(ASPECT_RATIOS.find(r => r.value === e.target.value) || ASPECT_RATIOS[0])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="concept" className="block text-sm font-medium text-gray-300">Poster Concept</label>
              <Button
                  onClick={onGetSuggestions}
                  isLoading={isGettingSuggestions}
                  disabled={!processedImagesExist || isGettingSuggestions}
                  variant="secondary"
                  className="py-1 px-2 text-xs"
              >
                  <MagicWandIcon className="w-4 h-4 mr-1"/>
                  Suggest
              </Button>
            </div>
            <textarea
                id="concept"
                rows={4}
                value={concept}
                onChange={(e) => onConceptChange(e.target.value)}
                placeholder="e.g., A vibrant, energetic poster for a sports shoe..."
                className="block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
              <label htmlFor="background-concept" className="block text-sm font-medium text-gray-300">Background Description (Optional)</label>
              <textarea
                  id="background-concept"
                  rows={2}
                  value={backgroundConcept}
                  onChange={(e) => onBackgroundConceptChange(e.target.value)}
                  placeholder="e.g., On a wooden table with a blurry cafe in the background"
                  className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
          </div>
           <div>
            <label htmlFor="posterText" className="block text-sm font-medium text-gray-300">Poster Text (Optional)</label>
            <input
                type="text"
                id="posterText"
                value={posterText}
                onChange={(e) => onPosterTextChange(e.target.value)}
                placeholder="e.g., 'Summer Sale' or 'New Arrival'"
                className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="font-style" className="block text-sm font-medium text-gray-300">Font Style</label>
            <select
              id="font-style"
              value={selectedFont.value}
              onChange={(e) => onFontChange(FONTS.find(f => f.value === e.target.value) || FONTS[0])}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50"
              disabled={!posterText}
            >
              {FONTS.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}
            </select>
          </div>
          <MultiFileInput 
            onAddFiles={onAddReferenceImages}
            onRemoveFile={onRemoveReferenceImage}
            selectedFiles={referenceImages} 
            label="Reference Image(s) (Optional)" 
          />
        </div>
      </Card>
      
      <Card title="Step 3: Generate">
        <Button
          onClick={onGeneratePoster}
          isLoading={isGeneratingPoster}
          disabled={!processedImagesExist || isGeneratingPoster || !concept}
          className="w-full"
        >
          <MagicWandIcon className="w-5 h-5"/>
          Generate 6 Posters
        </Button>
      </Card>
    </aside>
  );
};