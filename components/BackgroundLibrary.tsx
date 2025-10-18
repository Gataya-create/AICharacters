
import React, { useState, useRef } from 'react';
import { Background } from '../types';
import { EditIcon, TrashIcon, CheckCircleIcon, ImportIcon, ExportIcon } from './icons';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';

interface BackgroundLibraryProps {
  backgrounds: Background[];
  selectedBackgroundId: string | null;
  onBackgroundSelect: (id: string) => void;
  onBackgroundUpdate: (id:string, updates: Partial<Pick<Background, 'name'>>) => void;
  onBackgroundDelete: (id: string) => void;
  onBackgroundsImport: (backgrounds: Background[]) => void;
}

const BackgroundLibrary: React.FC<BackgroundLibraryProps> = ({ backgrounds, selectedBackgroundId, onBackgroundSelect, onBackgroundUpdate, onBackgroundDelete, onBackgroundsImport }) => {
  const { t } = useTranslation();
  const [editingBackground, setEditingBackground] = useState<Background | null>(null);
  const [newName, setNewName] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const handleEditClick = (background: Background) => {
    setEditingBackground(background);
    setNewName(background.name);
  };
  
  const handleSaveName = () => {
    if (editingBackground && newName.trim()) {
      onBackgroundUpdate(editingBackground.id, { name: newName.trim() });
      setEditingBackground(null);
    }
  };

  const handleExport = () => {
    if (backgrounds.length === 0) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backgrounds, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "ai-storyboard-backgrounds.json";
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
          throw new Error('Invalid JSON structure for backgrounds.');
        }
        onBackgroundsImport(imported as Background[]);
      } catch (err) {
        console.error("Failed to import backgrounds", err);
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

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-300">{t('backgroundLibraryTitle')}</h2>
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleImportClick} 
                title={t('importBackgroundsTitle')} 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                aria-label={t('importBackgroundsTitle')}
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
                title={t('exportBackgroundsTitle')} 
                disabled={backgrounds.length === 0} 
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('exportBackgroundsTitle')}
            >
                <ExportIcon />
            </button>
        </div>
      </div>

      {backgrounds.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{t('backgroundLibraryEmpty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2">
          {backgrounds.map((background) => {
            const isSelected = selectedBackgroundId === background.id;
            return (
              <div key={background.id} className="relative group cursor-pointer" onClick={() => onBackgroundSelect(background.id)}>
                <div className={`aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg bg-gray-700 transition-all duration-300 ${isSelected ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent group-hover:ring-purple-400'}`}>
                  <img src={background.imageUrl} alt={background.name} className="w-full h-full object-cover object-center" />
                </div>
                {isSelected && (
                    <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-1 text-white">
                        <CheckCircleIcon />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 rounded-b-lg">
                  <p className="text-white text-sm font-medium truncate">{background.name}</p>
                </div>
                <div className="absolute top-0 right-0 p-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(background); }} title={t('editBackgroundNameModalTitle')} className="bg-blue-500/80 hover:bg-blue-600 text-white p-1.5 rounded-full"><EditIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); onBackgroundDelete(background.id); }} title="Delete Background" className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full"><TrashIcon /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editingBackground && (
        <Modal title={t('editBackgroundNameModalTitle')} onClose={() => setEditingBackground(null)}>
            <div className="space-y-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setEditingBackground(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">{t('cancelButton')}</button>
                    <button onClick={handleSaveName} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md">{t('saveButton')}</button>
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default BackgroundLibrary;
