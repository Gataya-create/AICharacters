
import React, { useState } from 'react';
import { generateBackground } from '../services/geminiService';
import { Background, AspectRatio } from '../types';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface BackgroundCreatorProps {
  onBackgroundCreated: (background: Omit<Background, 'id'>) => void;
}

const STYLES = ['3D Pixar', 'Anime', 'Ghibli Style', 'Realistic', 'Fantasy Art', 'Cartoon', 'Cyberpunk', 'Watercolor', 'Pencil Sketch', 'Pixel Art'];

const BackgroundCreator: React.FC<BackgroundCreatorProps> = ({ onBackgroundCreated }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<{ url: string; mimeType: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the background.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateBackground(prompt, style, aspectRatio);
      setGeneratedImage(result);
    } catch (err) {
      setError(t('errorBackgroundGenerationFailed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!name || !generatedImage) {
      setError(t('errorBackgroundSave'));
      return;
    }
    onBackgroundCreated({ name, imageUrl: generatedImage.url, mimeType: generatedImage.mimeType });
    resetForm();
  };

  const resetForm = () => {
    setPrompt('');
    setName('');
    setGeneratedImage(null);
    setError('');
  };

  const canSave = name && generatedImage;

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg space-y-4">
      <h2 className="text-xl font-semibold text-purple-300">{t('createBackgroundTitle')}</h2>
      
      <div>
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

      <div className="space-y-3">
        <div>
            <label htmlFor="bg-prompt" className="block text-sm font-medium text-gray-300 mb-1">{t('backgroundDescriptionLabel')}</label>
            <textarea
              id="bg-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('backgroundDescriptionPlaceholder')}
              className="w-full h-24 p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isLoading}
              aria-required="true"
            />
        </div>
        <div>
            <h3 className="font-semibold text-gray-300 mb-2">{t('aspectRatioLabel')}</h3>
            <div className="flex space-x-2">
            {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
                <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${aspectRatio === ratio ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                disabled={isLoading}
                >
                {ratio}
                </button>
            ))}
            </div>
        </div>
        <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">
          {isLoading ? <Spinner /> : (generatedImage ? t('regenerateButton') : t('generateBackgroundButton'))}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <div className="mt-4 space-y-4">
        <div className="relative h-40 bg-gray-700/50 rounded-md flex items-center justify-center overflow-hidden">
            {isLoading && <Spinner text={t('loadingBackground')} />}
            {generatedImage && <img src={generatedImage.url} alt={t('previewAlt')} className="h-full w-full object-cover" />}
            {!isLoading && !generatedImage && <span className="text-gray-500">{t('previewPlaceholder')}</span>}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('backgroundNamePlaceholder')}
          className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          disabled={!generatedImage}
        />
        <button onClick={handleSave} disabled={!canSave} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">
          {t('saveBackgroundButton')}
        </button>
      </div>
    </div>
  );
};

export default BackgroundCreator;
