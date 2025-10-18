
import React, { useState } from 'react';
import { Character, Background, AspectRatio } from './types';
import useCharacters from './hooks/useCharacters';
import useBackgrounds from './hooks/useBackgrounds';
import CharacterCreator from './components/CharacterCreator';
import CharacterLibrary from './components/CharacterLibrary';
import SceneComposer from './components/SceneComposer';
import ResultViewer from './components/ResultViewer';
import { Header } from './components/Header';
import BackgroundCreator from './components/BackgroundCreator';
import BackgroundLibrary from './components/BackgroundLibrary';
import { PeopleIcon, LandscapeIcon } from './components/icons';
import { useTranslation } from './hooks/useTranslation';

type ActiveTab = 'characters' | 'backgrounds';

function App() {
  const { t } = useTranslation();
  const { characters, addCharacter, updateCharacter, removeCharacter, importCharacters } = useCharacters();
  const { backgrounds, addBackground, updateBackground, removeBackground, importBackgrounds } = useBackgrounds();
  
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<{ url: string, mimeType: string } | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');

  const toggleCharacterSelection = (characterId: string) => {
    setSelectedCharacterIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(characterId)) {
        newSelection.delete(characterId);
      } else {
        newSelection.add(characterId);
      }
      return newSelection;
    });
  };

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackgroundId(prev => (prev === backgroundId ? null : backgroundId));
  };

  const selectedCharacters = characters.filter(c => selectedCharacterIds.has(c.id));
  const selectedBackground = backgrounds.find(b => b.id === selectedBackgroundId) || null;

  const TabButton: React.FC<{tabName: ActiveTab, label: string, children: React.ReactNode}> = ({ tabName, label, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === tabName ? 'bg-gray-800 text-purple-300' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/80 hover:text-white'}`}
      aria-selected={activeTab === tabName}
      role="tab"
    >
      {children}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
          <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col flex-grow">
            <div className="flex w-full rounded-t-lg overflow-hidden" role="tablist">
              <TabButton tabName="characters" label={t('charactersTab')}>
                <PeopleIcon />
              </TabButton>
              <TabButton tabName="backgrounds" label={t('backgroundsTab')}>
                <LandscapeIcon />
              </TabButton>
            </div>
            
            <div className="p-1 flex-grow flex flex-col">
              {activeTab === 'characters' && (
                <div className="space-y-4 flex flex-col flex-grow" role="tabpanel">
                  <CharacterCreator onCharacterCreated={addCharacter} />
                  <CharacterLibrary
                    characters={characters}
                    selectedCharacterIds={selectedCharacterIds}
                    onCharacterSelect={toggleCharacterSelection}
                    onCharacterUpdate={updateCharacter}
                    onCharacterDelete={removeCharacter}
                    onCharactersImport={importCharacters}
                  />
                </div>
              )}
              {activeTab === 'backgrounds' && (
                <div className="space-y-4 flex flex-col flex-grow" role="tabpanel">
                  <BackgroundCreator onBackgroundCreated={addBackground} />
                  <BackgroundLibrary
                    backgrounds={backgrounds}
                    selectedBackgroundId={selectedBackgroundId}
                    onBackgroundSelect={handleBackgroundSelect}
                    onBackgroundUpdate={updateBackground}
                    onBackgroundDelete={removeBackground}
                    onBackgroundsImport={importBackgrounds}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col lg:flex-row gap-6">
            <div className="flex-1 lg:w-1/2 flex flex-col">
                <SceneComposer 
                    selectedCharacters={selectedCharacters} 
                    selectedBackground={selectedBackground}
                    onSceneGenerated={setGeneratedImage}
                    isComposing={isComposing}
                    setIsComposing={setIsComposing}
                />
            </div>
            <div className="flex-1 lg:w-1/2 flex flex-col">
                <ResultViewer 
                    generatedImage={generatedImage}
                    onImageUpdate={setGeneratedImage}
                    isComposing={isComposing}
                />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
