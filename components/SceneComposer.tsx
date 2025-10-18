
import React, { useState } from 'react';
import { Character, Background } from '../types';
import { createScene } from '../services/geminiService';
import Spinner from './Spinner';
import { useTranslation } from '../hooks/useTranslation';

interface SceneComposerProps {
  selectedCharacters: Character[];
  selectedBackground: Background | null;
  onSceneGenerated: (image: { url: string; mimeType: string; }) => void;
  isComposing: boolean;
  setIsComposing: (isComposing: boolean) => void;
}

const SCENE_IDEAS = [
  'sceneIdea1',
  'sceneIdea2',
  'sceneIdea3',
  'sceneIdea4',
] as const;

const SceneComposer: React.FC<SceneComposerProps> = ({ selectedCharacters, selectedBackground, onSceneGenerated, isComposing, setIsComposing }) => {
  const { t } = useTranslation();
  const [scenePrompt, setScenePrompt] = useState('');
  const [error, setError] = useState('');
  
  const canGenerate = selectedCharacters.length > 0 && selectedBackground && scenePrompt.trim() !== '';

  const handleGenerateScene = async () => {
    if (!canGenerate) {
      setError(t('errorComposeFailed'));
      return;
    }
    setIsComposing(true);
    setError('');
    try {
      const result = await createScene(selectedCharacters, selectedBackground, scenePrompt);
      onSceneGenerated(result);
    } catch (err) {
      setError(t('errorSceneGenerationFailed'));
      console.error(err);
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg flex flex-col flex-grow">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">{t('composeSceneTitle')}</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">{t('selectedCharactersLabel')}</h3>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-900/50 rounded-md min-h-[60px]">
          {selectedCharacters.length > 0 ? (
            selectedCharacters.map(char => (
              <div key={char.id} className="flex items-center space-x-2 bg-gray-700 p-1 rounded-md">
                <img src={char.imageUrl} alt={char.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm">{char.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm self-center px-2">{t('selectedCharactersPlaceholder')}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-300 mb-2">{t('selectedBackgroundLabel')}</h3>
        <div className="flex flex-wrap gap-2 p-2 bg-gray-900/50 rounded-md min-h-[60px]">
          {selectedBackground ? (
              <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-md">
                <img src={selectedBackground.imageUrl} alt={selectedBackground.name} className="w-8 h-8 rounded-md object-cover" />
                <span className="text-sm">{selectedBackground.name}</span>
              </div>
          ) : (
            <p className="text-gray-500 text-sm self-center px-2">{t('selectedBackgroundPlaceholder')}</p>
          )}
        </div>
      </div>
      
      <div className="mb-2 flex-grow flex flex-col">
        <label htmlFor="scenePrompt" className="font-semibold text-gray-300 mb-2">{t('sceneDescriptionLabel')}</label>
        <textarea
          id="scenePrompt"
          value={scenePrompt}
          onChange={(e) => setScenePrompt(e.target.value)}
          placeholder={t('sceneDescriptionPlaceholder')}
          className="w-full flex-grow p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
          disabled={isComposing}
        />
      </div>

      <div className="mb-4">
          <h3 className="font-semibold text-gray-400 text-sm mb-2">{t('sceneIdeasTitle')}</h3>
          <div className="flex flex-wrap gap-2">
              {SCENE_IDEAS.map(ideaKey => (
                  <button
                      key={ideaKey}
                      onClick={() => setScenePrompt(t(ideaKey))}
                      disabled={isComposing}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full transition-colors disabled:opacity-50"
                  >
                      {t(ideaKey)}
                  </button>
              ))}
          </div>
      </div>

      {error && <p className="text-red-400 text-sm my-4">{error}</p>}
      
      <button
        onClick={handleGenerateScene}
        disabled={!canGenerate || isComposing}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 mt-auto"
      >
        {isComposing ? <Spinner text={t('generatingScene')}/> : t('generateSceneButton')}
      </button>
    </div>
  );
};

export default SceneComposer;
