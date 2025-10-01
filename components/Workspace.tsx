import React, { useState } from 'react';
import { ImageFile } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageGridDisplayProps {
  title: string;
  imageSrcs: string[];
  isLoading: boolean;
  loadingText: string;
  placeholderText: string;
}

const ImageGridDisplay: React.FC<ImageGridDisplayProps> = ({ title, imageSrcs, isLoading, loadingText, placeholderText }) => (
  <div className="flex-1 flex flex-col min-w-0">
    <h4 className="text-center font-semibold text-gray-400 mb-2">{title}</h4>
    <div className="aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-gray-700 p-2">
      {isLoading ? <Spinner text={loadingText} /> :
        imageSrcs.length > 0 ? (
          <div className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center gap-2">
            {imageSrcs.map((src, index) => (
              <img key={index} src={src} alt={`${title} ${index + 1}`} className="h-full w-auto object-contain rounded-md flex-shrink-0" />
            ))}
          </div>
        ) :
        <p className="text-gray-500 text-sm p-4 text-center">{placeholderText}</p>
      }
    </div>
  </div>
);

interface WorkspaceProps {
  productImages: ImageFile[];
  processedImages: string[];
  isRemovingBackground: boolean;
  generatedPosters: string[];
  isGeneratingPoster: boolean;
  selectedPosterIndex: number | null;
  onSelectPoster: (index: number) => void;
  onRefinePoster: (prompt: string) => void;
  isRefiningPoster: boolean;
  onSavePoster: (poster: string) => void;
  error: string | null;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  productImages, processedImages, isRemovingBackground, generatedPosters, isGeneratingPoster, selectedPosterIndex,
  onSelectPoster, onRefinePoster, isRefiningPoster, onSavePoster, error,
}) => {
  const [refinement, setRefinement] = useState('');

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPosterIndex !== null) {
      onRefinePoster(refinement);
      setRefinement('');
    }
  };

  const downloadImage = (base64Image: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Image}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      if (selectedPosterIndex !== null && generatedPosters[selectedPosterIndex]) {
          e.dataTransfer.setData("application/poster-data", generatedPosters[selectedPosterIndex]);
      }
  };
  
  const selectedPoster = selectedPosterIndex !== null ? generatedPosters[selectedPosterIndex] : null;

  return (
    <section className="flex-grow flex flex-col gap-6">
      <Card className="flex-grow flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <ImageGridDisplay 
            title="1. Original Product(s)" 
            imageSrcs={productImages.map(img => img.preview)} 
            isLoading={false} 
            loadingText="" 
            placeholderText="Upload product images" 
          />
          <ImageGridDisplay 
            title="2. Background Removed" 
            imageSrcs={processedImages.map(base64 => `data:image/png;base64,${base64}`)} 
            isLoading={isRemovingBackground} 
            loadingText="Removing Backgrounds..." 
            placeholderText="AI will place processed images here" 
          />
        </div>
        <div className="flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-indigo-400 mb-2 text-center">3. Final Poster Variations</h3>
          {error && <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-md mb-4 text-sm">{error}</div>}
          <div className="flex-grow bg-gray-900/50 rounded-lg border-2 border-gray-700 min-h-[300px] p-2">
            {isGeneratingPoster ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-md flex items-center justify-center">
                    <Spinner text="Generating..." />
                  </div>
                ))}
              </div>
            ) : generatedPosters.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-full">
                    {generatedPosters.map((poster, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectPoster(index)}
                            className={`relative group cursor-pointer rounded-md overflow-hidden border-2 transition-all ${selectedPosterIndex === index ? 'border-indigo-400 ring-2 ring-indigo-400/50' : 'border-transparent hover:border-gray-500'}`}
                        >
                            <img src={`data:image/png;base64,${poster}`} alt={`Generated Poster ${index + 1}`} className="w-full h-full object-contain" />
                            {isRefiningPoster && selectedPosterIndex === index && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <Spinner text="Refining..." />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold">
                                {selectedPosterIndex === index ? 'Selected' : 'Click to Select'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <div className="h-full flex items-center justify-center"><p className="text-gray-500">Your generated posters will appear here.</p></div>}
          </div>
          {selectedPoster && (
            <div 
              className="mt-4 flex flex-col sm:flex-row gap-4 items-center"
              draggable
              onDragStart={handleDragStart}
            >
              <form onSubmit={handleRefineSubmit} className="flex-grow flex gap-2">
                <input
                  type="text"
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  placeholder="e.g., change background to a beach"
                  className="flex-grow shadow-sm sm:text-sm bg-gray-700 border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Refine selected poster"
                />
                <Button type="submit" variant="secondary" isLoading={isRefiningPoster} disabled={!refinement}>Refine</Button>
              </form>
              <div 
                 className="p-2 rounded-md bg-gray-700/50 text-gray-300 cursor-grab text-sm"
                 title="Drag this area to save the selected poster in the gallery below"
              >
                Drag to Save
              </div>
              <Button onClick={() => downloadImage(selectedPoster, 'ai-poster.png')}>
                <DownloadIcon className="w-5 h-5"/>
                Download
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
};