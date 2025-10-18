import React, { useState } from 'react';
import { generateCharacter, restyleCharacter } from '../services/geminiService';
import { Character } from '../types';
import Spinner from './Spinner';
import { UploadIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';

interface CharacterCreatorProps {
  onCharacterCreated: (character: Omit<Character, 'id'>) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const STYLES = ['3D Pixar', 'Anime', 'Ghibli Style', 'Realistic', 'Fantasy Art', 'Cartoon', 'Cyberpunk', 'Watercolor', 'Pencil Sketch', 'Pixel Art', 'Sticker', 'Superhero'];

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCharacterCreated }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'generate' | 'upload'>('generate');

  const [appearance, setAppearance] = useState('');
  const [clothing, setClothing] = useState('');
  const [accessories, setAccessories] = useState('');
  const [mood, setMood] = useState('');

  const [name, setName] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [generatedImage, setGeneratedImage] = useState<{ url: string; mimeType: string; } | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ url: string; mimeType: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (newTab: 'generate' | 'upload') => {
    if (tab === newTab) return;
    setTab(newTab);
    // Reset output-related state when switching tabs
    setGeneratedImage(null);
    setUploadedImage(null);
    setName('');
    setError('');
  };
  
  const handleGenerate = async () => {
    if (!appearance.trim()) {
      setError(t('errorAppearanceEmpty'));
      return;
    }
    setIsLoading(true);
    setError('');
    
    const constructPrompt = () => {
      let parts = [appearance.trim()];
      if (clothing.trim()) parts.push(`wearing ${clothing.trim()}`);
      if (accessories.trim()) parts.push(`with accessories such as ${accessories.trim()}`);
      if (mood.trim()) parts.push(`The character's expression is ${mood.trim()}`);
      return parts.join('. ');
    };
    const detailedPrompt = constructPrompt();

    try {
      const result = await generateCharacter(detailedPrompt, style);
      setGeneratedImage(result);
    } catch (err) {
      setError(t('errorCharacterGenerationFailed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError('');
      try {
        const url = await fileToBase64(file);
        const originalImageData = { url, mimeType: file.type };
        setUploadedImage(originalImageData);
        const restyledImage = await restyleCharacter(originalImageData.url, originalImageData.mimeType, style);
        setGeneratedImage(restyledImage);
      } catch (err) {
        setError(t('errorRestyleFailed'));
        console.error(err);
        setUploadedImage(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegenerateRestyle = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setError('');
    try {
        const result = await restyleCharacter(uploadedImage.url, uploadedImage.mimeType, style);
        setGeneratedImage(result);
    } catch (err) {
        setError(t('errorRestyleFailed'));
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!name || !generatedImage) {
      setError(t('errorSaveFailed'));
      return;
    }
    onCharacterCreated({ name, imageUrl: generatedImage.url, mimeType: generatedImage.mimeType });
    resetForm();
  };

  const handleClearPreview = () => {
    setGeneratedImage(null);
    setUploadedImage(null);
    setName('');
  };

  const resetForm = () => {
    setAppearance('');
    setClothing('');
    setAccessories('');
    setMood('');
    setName('');
    setGeneratedImage(null);
    setUploadedImage(null);
    setError('');
  };

  const canSave = name && generatedImage;

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">{t('createCharacterTitle')}</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">{t('styleLabel')}</h3>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              disabled={isLoading}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${style === s ? 'bg-purple-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex border-b border-gray-700 mb-4">
        <button onClick={() => handleTabChange('generate')} className={`px-4 py-2 text-sm font-medium ${tab === 'generate' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
          {t('generateWithAi')}
        </button>
        <button onClick={() => handleTabChange('upload')} className={`px-4 py-2 text-sm font-medium ${tab === 'upload' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
          {t('uploadImage')}
        </button>
      </div>

      {tab === 'generate' && (
        <div className="space-y-3">
           <div>
              <label htmlFor="appearance" className="block text-sm font-medium text-gray-300 mb-1">{t('appearanceLabel')}</label>
              <textarea
                id="appearance"
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder={t('appearancePlaceholder')}
                className="w-full h-20 p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoading}
                aria-required="true"
              />
          </div>
          <div>
              <label htmlFor="clothing" className="block text-sm font-medium text-gray-300 mb-1">{t('clothingLabel')}</label>
              <input
                id="clothing"
                type="text"
                value={clothing}
                onChange={(e) => setClothing(e.target.value)}
                placeholder={t('clothingPlaceholder')}
                className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoading}
              />
          </div>
           <div>
              <label htmlFor="accessories" className="block text-sm font-medium text-gray-300 mb-1">{t('accessoriesLabel')}</label>
              <input
                id="accessories"
                type="text"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                placeholder={t('accessoriesPlaceholder')}
                className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoading}
              />
          </div>
           <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-300 mb-1">{t('moodLabel')}</label>
              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder={t('moodPlaceholder')}
                className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoading}
              />
          </div>
          <button onClick={handleGenerate} disabled={isLoading || !appearance.trim()} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">
            {isLoading ? <Spinner /> : (generatedImage ? t('regenerateButton') : t('generateButton'))}
          </button>
        </div>
      )}

      {tab === 'upload' && (
        <div>
          {!uploadedImage ? (
            <>
              <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-purple-400 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <UploadIcon />
                  <span className="font-medium text-gray-400">
                    {t('uploadLabel')}{' '}
                    <span className="text-purple-400 underline">{t('uploadLink')}</span>
                  </span>
                </span>
                <input type="file" name="file_upload" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileUpload} disabled={isLoading} />
              </label>
              <p className="text-xs text-center text-gray-400 mt-2">{t('styleWillBeApplied')}</p>
            </>
          ) : (
             <button onClick={handleRegenerateRestyle} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">
                {isLoading ? <Spinner /> : t('regenerateButton')}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="mt-4 space-y-4">
        <div className="relative h-48 bg-gray-700/50 rounded-md flex items-center justify-center overflow-hidden">
            {isLoading && <Spinner text={tab === 'generate' ? t('loadingCharacter') : t('loadingRestyle')} />}
            {generatedImage && <img src={generatedImage.url} alt={t('previewAlt')} className="h-full w-full object-contain" />}
            {!isLoading && !generatedImage && <span className="text-gray-500">{t('previewPlaceholder')}</span>}
             {generatedImage && !isLoading && (
                <button 
                    onClick={handleClearPreview}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-10"
                    aria-label="Clear preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('characterNamePlaceholder')}
          className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          disabled={!generatedImage}
        />
        <button onClick={handleSave} disabled={!canSave} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">
          {t('saveToLibraryButton')}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreator;
