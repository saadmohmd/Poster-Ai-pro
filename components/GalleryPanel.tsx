import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';

interface GalleryPanelProps {
  savedPosters: string[];
  onSavePoster: (poster: string) => void;
  onRemovePoster: (index: number) => void;
}

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ savedPosters, onSavePoster, onRemovePoster }) => {
    const [isOver, setIsOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const posterData = e.dataTransfer.getData("application/poster-data");
        if (posterData) {
            onSavePoster(posterData);
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

  return (
    <footer 
        className={`bg-gray-800/60 border-t-2 border-gray-700 p-4 transition-colors duration-300 ${isOver ? 'border-indigo-500 bg-indigo-900/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-lg font-semibold text-center text-gray-300 mb-4">Final Posters Gallery</h2>
        {savedPosters.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Drag and drop your finished posters here to save them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {savedPosters.map((poster, index) => (
              <div key={index} className="group relative aspect-square rounded-md overflow-hidden border-2 border-gray-700/50">
                <img src={`data:image/png;base64,${poster}`} alt={`Saved poster ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-2">
                    <button
                        onClick={() => downloadImage(poster, `poster-${index + 1}.png`)}
                        className="text-xs bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold p-2 rounded-full"
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button
                        onClick={() => onRemovePoster(index)}
                        className="text-xs bg-red-600/80 hover:bg-red-500 text-white font-bold p-2 rounded-full"
                        title="Remove"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};