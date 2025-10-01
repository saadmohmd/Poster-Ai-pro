import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Workspace } from './components/Workspace';
import { GalleryPanel } from './components/GalleryPanel';
import { removeBackground, generatePoster, refinePoster, getPosterConceptSuggestions } from './services/geminiService';
import { ImageFile, AspectRatio, Font } from './types';
import { fileToMimeTypeAndBase64 } from './utils/fileUtils';
import { ASPECT_RATIOS, FONTS } from './constants';

type LoadingStates = {
  removingBackground: boolean;
  generatingPoster: boolean;
  refiningPoster: boolean;
  gettingSuggestions: boolean;
};

const App: React.FC = () => {
  const [productImages, setProductImages] = useState<ImageFile[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);
  const [concept, setConcept] = useState<string>('');
  const [backgroundConcept, setBackgroundConcept] = useState<string>('');
  const [posterText, setPosterText] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<Font>(FONTS[0]);
  const [generatedPosters, setGeneratedPosters] = useState<string[]>([]);
  const [selectedPosterIndex, setSelectedPosterIndex] = useState<number | null>(null);
  const [savedPosters, setSavedPosters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingStates>({
    removingBackground: false,
    generatingPoster: false,
    refiningPoster: false,
    gettingSuggestions: false,
  });

  const handleSetLoading = (key: keyof LoadingStates, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };
  
  useEffect(() => {
    const autoRemoveBackground = async () => {
        if (productImages.length === 0) {
            setProcessedImages([]);
            return;
        }
        
        setError(null);
        setProcessedImages([]);
        setGeneratedPosters([]);
        setSelectedPosterIndex(null);
        handleSetLoading('removingBackground', true);

        try {
            const backgroundRemovalPromises = productImages.map(async (imageFile) => {
                const { mimeType, base64 } = await fileToMimeTypeAndBase64(imageFile.file);
                return removeBackground(base64, mimeType);
            });
            const results = await Promise.all(backgroundRemovalPromises);
            setProcessedImages(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove background from one or more images.');
        } finally {
            handleSetLoading('removingBackground', false);
        }
    };
    autoRemoveBackground();
  }, [productImages]);


  const handleGeneratePoster = useCallback(async () => {
    if (processedImages.length === 0) {
      setError('Please upload at least one product image first.');
      return;
    }
    if (!concept) {
        setError('Please provide a concept for the poster.');
        return;
    }

    setError(null);
    setGeneratedPosters([]);
    setSelectedPosterIndex(null);
    handleSetLoading('generatingPoster', true);
    
    try {
      let refImagePayloads = null;
      if (referenceImages.length > 0) {
        refImagePayloads = await Promise.all(
          referenceImages.map(refImg => fileToMimeTypeAndBase64(refImg.file))
        );
      }
      const results = await generatePoster({
        productImagesBase64: processedImages,
        concept,
        aspectRatio: aspectRatio.value,
        referenceImages: refImagePayloads,
        posterText,
        fontStyle: selectedFont.value,
        backgroundConcept,
      });
      setGeneratedPosters(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate posters.');
    } finally {
      handleSetLoading('generatingPoster', false);
    }
  }, [processedImages, concept, aspectRatio, referenceImages, posterText, selectedFont, backgroundConcept]);

  const handleRefinePoster = useCallback(async (refinementPrompt: string) => {
    if (selectedPosterIndex === null) {
      setError('Please select a poster to refine.');
      return;
    }
    const posterToRefine = generatedPosters[selectedPosterIndex];
    if (!posterToRefine) {
      setError('Selected poster not found.');
      return;
    }
    if (!refinementPrompt) {
        setError('Please provide a refinement instruction.');
        return;
    }
    setError(null);
    handleSetLoading('refiningPoster', true);
    try {
      const result = await refinePoster(posterToRefine, refinementPrompt);
      const newPosters = [...generatedPosters];
      newPosters[selectedPosterIndex] = result;
      setGeneratedPosters(newPosters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine poster.');
    } finally {
      handleSetLoading('refiningPoster', false);
    }
  }, [generatedPosters, selectedPosterIndex]);

    const handleGetSuggestions = useCallback(async () => {
        if (processedImages.length === 0) {
            setError('Please upload a product image first.');
            return;
        }
        setError(null);
        handleSetLoading('gettingSuggestions', true);
        try {
            const suggestion = await getPosterConceptSuggestions(processedImages);
            setConcept(suggestion);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get suggestions.');
        } finally {
            handleSetLoading('gettingSuggestions', false);
        }
    }, [processedImages]);


  const handleSavePoster = (poster: string) => {
    if (!savedPosters.includes(poster)) {
      setSavedPosters(prev => [...prev, poster]);
    }
  };
  
  const handleRemoveSavedPoster = (index: number) => {
      setSavedPosters(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProductImages = (newFiles: FileList) => {
    const imageFiles = Array.from(newFiles).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setProductImages(prev => [...prev, ...imageFiles]);
  };

  const handleRemoveProductImage = (index: number) => {
      setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddReferenceImages = (newFiles: FileList) => {
      const imageFiles = Array.from(newFiles).map(file => ({ file, preview: URL.createObjectURL(file) }));
      setReferenceImages(prev => [...prev, ...imageFiles]);
  };

  const handleRemoveReferenceImage = (index: number) => {
      setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col">
      <header className="py-4 px-8 border-b border-gray-700/50 shadow-lg bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-indigo-400 tracking-wider">AI Poster Pro</h1>
        <p className="text-sm text-gray-400">Your futuristic design studio</p>
      </header>
      
      <main className="flex-grow flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6">
        <ControlPanel
          onAddProductImages={handleAddProductImages}
          onRemoveProductImage={handleRemoveProductImage}
          onAddReferenceImages={handleAddReferenceImages}
          onRemoveReferenceImage={handleRemoveReferenceImage}
          productImages={productImages}
          referenceImages={referenceImages}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          concept={concept}
          onConceptChange={setConcept}
          backgroundConcept={backgroundConcept}
          onBackgroundConceptChange={setBackgroundConcept}
          posterText={posterText}
          onPosterTextChange={setPosterText}
          selectedFont={selectedFont}
          onFontChange={setSelectedFont}
          onGeneratePoster={handleGeneratePoster}
          isGeneratingPoster={loading.generatingPoster}
          processedImagesExist={processedImages.length > 0}
          onGetSuggestions={handleGetSuggestions}
          isGettingSuggestions={loading.gettingSuggestions}
        />
        <Workspace
          productImages={productImages}
          processedImages={processedImages}
          isRemovingBackground={loading.removingBackground}
          generatedPosters={generatedPosters}
          isGeneratingPoster={loading.generatingPoster}
          selectedPosterIndex={selectedPosterIndex}
          onSelectPoster={setSelectedPosterIndex}
          onRefinePoster={handleRefinePoster}
          isRefiningPoster={loading.refiningPoster}
          onSavePoster={handleSavePoster}
          error={error}
        />
      </main>
      
      <GalleryPanel 
        savedPosters={savedPosters} 
        onSavePoster={handleSavePoster} 
        onRemovePoster={handleRemoveSavedPoster}
      />
    </div>
  );
};

export default App;