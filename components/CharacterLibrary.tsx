
import React, { useState, useRef } from 'react';
import { Character } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon, ImportIcon, ExportIcon, VariationsIcon } from './icons';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';
import { generateCharacterVariations } from '../services/geminiService';
import Spinner from './Spinner';

interface CharacterLibraryProps {
  characters: Character[];
  selectedCharacterIds: Set<string>;
  onCharacterSelect: (id: string) => void;
  onCharacterUpdate: (id:string, updates: Partial<Pick<Character, 'name'>>) => void;
  onCharacterDelete: (id: string) => void;
  onCharactersImport: (characters: Character[]) => void;
}

const CharacterLibrary: React.FC<CharacterLibraryProps> = ({ characters, selectedCharacterIds, onCharacterSelect, onCharacterUpdate, onCharacterDelete, onCharactersImport }) => {
  const { t } = useTranslation();
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [newName, setNewName] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  const [variationModalData, setVariationModalData] = useState<{
    character: Character | null;
    variations: { url: string; mimeType: string; }[];
    selectedIndices: Set<number>;
    isLoading: boolean;
    error: string | null;
  }>({ character: null, variations: [], selectedIndices: new Set(), isLoading: false, error: null });
  
  const handleEditClick = (character: Character) => {
    setEditingCharacter(character);
    setNewName(character.name);
  };
  
  const handleSaveName = () => {
    if (editingCharacter && newName.trim()) {
      onCharacterUpdate(editingCharacter.id, { name: newName.trim() });
      setEditingCharacter(null);
    }
  };

  const handleExport = () => {
    if (characters.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(characters, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "ai-storyboard-characters.json";
    link.click();
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') throw new Error('Invalid file content');
        const imported = JSON.parse(content);
        
        if (!Array.isArray(imported) || !imported.every(item => 
          item.id && typeof item.id === 'string' &&
          item.name && typeof item.name === 'string' &&
          item.imageUrl && typeof item.imageUrl === 'string' &&
          item.mimeType && typeof item.mimeType === 'string'
        )) {
          throw new Error('Invalid JSON structure for characters.');
        }
        onCharactersImport(imported as Character[]);
      } catch (err) {
        console.error("Failed to import characters", err);
        alert(t('importErrorMessage'));
      } finally {
        if (e.target) {
          e.target.value = '';
        }
      }
    };
    reader.onerror = () => {
      alert(t('fileReadError'));
    };
    reader.readAsText(file);
  };

  const handleVariationsClick = async (e: React.MouseEvent, character: Character) => {
    e.stopPropagation();
    setVariationModalData({
        character,
        variations: [],
        selectedIndices: new Set(),
        isLoading: true,
        error: null,
    });

    try {
        const generatedVariations = await generateCharacterVariations(character, 3);
        setVariationModalData(prev => ({ ...prev, variations: generatedVariations, isLoading: false }));
    } catch (err) {
        console.error("Failed to generate variations", err);
        setVariationModalData(prev => ({ ...prev, isLoading: false, error: t('noVariationsGenerated') }));
    }
  };

  const handleCloseVariationModal = () => {
      setVariationModalData({ character: null, variations: [], selectedIndices: new Set(), isLoading: false, error: null });
  };

  const handleToggleVariationSelection = (index: number) => {
      setVariationModalData(prev => {
          const newSelection = new Set(prev.selectedIndices);
          if (newSelection.has(index)) {
              newSelection.delete(index);
          } else {
              newSelection.add(index);
          }
          return { ...prev, selectedIndices: newSelection };
      });
  };

  const handleSaveVariations = () => {
      if (!variationModalData.character || variationModalData.selectedIndices.size === 0) return;

      const newCharacters: Character[] = [];
      variationModalData.selectedIndices.forEach(index => {
          const variation = variationModalData.variations[index];
          const newCharacter: Character = {
              id: `char_var_${Date.now()}_${index}`,
              name: `${variationModalData.character!.name} Var. ${index + 1}`,
              imageUrl: variation.url,
              mimeType: variation.mimeType,
          };
          newCharacters.push(newCharacter);
      });

      if (newCharacters.length > 0) {
          onCharactersImport(newCharacters);
      }

      handleCloseVariationModal();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-300">{t('libraryTitle')}</h2>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleImportClick} 
                title={t('importCharactersTitle')} 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                aria-label={t('importCharactersTitle')}
            >
                <ImportIcon />
            </button>
            <input 
                type="file" 
                ref={importInputRef} 
                onChange={handleFileImport} 
                className="hidden" 
                accept="application/json" 
            />
            <button 
                onClick={handleExport} 
                title={t('exportCharactersTitle')} 
                disabled={characters.length === 0} 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('exportCharactersTitle')}
            >
                <ExportIcon />
            </button>
        </div>
      </div>

      {characters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{t('libraryEmpty')}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {characters.map((character) => {
            const isSelected = selectedCharacterIds.has(character.id);
            return (
              <div key={character.id} className="relative group cursor-pointer" onClick={() => onCharacterSelect(character.id)}>
                <div className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-700 transition-all duration-300 ${isSelected ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent group-hover:ring-purple-400'}`}>
                  <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover object-center" />
                </div>
                {isSelected && (
                    <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-1 text-white">
                        <CheckCircleIcon />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 rounded-b-lg">
                  <p className="text-white text-sm font-medium truncate">{character.name}</p>
                </div>
                <div className="absolute top-0 right-0 p-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(character); }} title={t('editCharacterNameModalTitle')} className="bg-blue-500/80 hover:bg-blue-600 text-white p-1.5 rounded-full"><EditIcon /></button>
                    <button onClick={(e) => handleVariationsClick(e, character)} title={t('variationButtonTooltip')} className="bg-purple-500/80 hover:bg-purple-600 text-white p-1.5 rounded-full"><VariationsIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); onCharacterDelete(character.id); }} title="Delete Character" className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full"><TrashIcon /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editingCharacter && (
        <Modal title={t('editCharacterNameModalTitle')} onClose={() => setEditingCharacter(null)}>
            <div className="space-y-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingCharacter(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">{t('cancelButton')}</button>
                    <button onClick={handleSaveName} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md">{t('saveButton')}</button>
                </div>
            </div>
        </Modal>
      )}
      {variationModalData.character && (
        <Modal
            title={t('variationsModalTitle').replace('{characterName}', variationModalData.character.name)}
            onClose={handleCloseVariationModal}
            size="xl"
        >
            <div className="min-h-[250px] flex flex-col">
                {variationModalData.isLoading ? (
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <Spinner text={t('generatingVariations')} />
                    </div>
                ) : variationModalData.error ? (
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <p className="text-red-400">{variationModalData.error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {variationModalData.variations.map((variation, index) => {
                            const isSelected = variationModalData.selectedIndices.has(index);
                            return (
                                <div 
                                    key={index} 
                                    className="relative group cursor-pointer"
                                    onClick={() => handleToggleVariationSelection(index)}
                                >
                                    <div className={`aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-700 transition-all duration-300 ${isSelected ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent group-hover:ring-purple-400'}`}>
                                        <img src={variation.url} alt={`Variation ${index + 1}`} className="w-full h-full object-cover object-center" />
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-1 text-white">
                                            <CheckCircleIcon />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-auto">
                    <button onClick={handleCloseVariationModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">{t('cancelButton')}</button>
                    <button 
                        onClick={handleSaveVariations} 
                        disabled={variationModalData.selectedIndices.size === 0 || variationModalData.isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-md"
                    >
                        {t('saveSelectedButton')}
                    </button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default CharacterLibrary;
