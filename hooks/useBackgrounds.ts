
import { useState, useEffect, useCallback } from 'react';
import { Background } from '../types';
import { getBackgroundsDB, addBackgroundDB, updateBackgroundDB, deleteBackgroundDB } from '../services/db';
import { defaultBackgrounds } from '../data/defaultBackgrounds';

const useBackgrounds = () => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        let storedBackgrounds = await getBackgroundsDB();
        
        if (storedBackgrounds.length === 0 && defaultBackgrounds.length > 0) {
          const defaultBgsWithIds: Background[] = defaultBackgrounds.map((bg, index) => ({
            ...bg,
            id: `default_bg_${Date.now()}_${index}`
          }));

          for (const bg of defaultBgsWithIds) {
            await addBackgroundDB(bg);
          }
          storedBackgrounds = await getBackgroundsDB();
        }

        setBackgrounds(storedBackgrounds);
      } catch (error) {
        console.error("Failed to load backgrounds from IndexedDB", error);
      }
    };
    
    loadBackgrounds();
  }, []);

  const addBackground = useCallback(async (background: Omit<Background, 'id'>) => {
    try {
      const newBackground: Background = {
        ...background,
        id: `bg_${Date.now()}`
      };
      await addBackgroundDB(newBackground);
      setBackgrounds(prev => [newBackground, ...prev]);
    } catch (error) {
      console.error("Failed to save background to IndexedDB", error);
    }
  }, []);

  const importBackgrounds = useCallback(async (importedBackgrounds: Background[]) => {
    const validBackgrounds = importedBackgrounds.filter(b =>
      b.id && typeof b.id === 'string' &&
      b.name && typeof b.name === 'string' &&
      b.imageUrl && typeof b.imageUrl === 'string' &&
      b.mimeType && typeof b.mimeType === 'string'
    );

    const existingIds = new Set(backgrounds.map(b => b.id));
    const newUniqueBackgrounds = validBackgrounds.filter(b => !existingIds.has(b.id));
    
    if (newUniqueBackgrounds.length > 0) {
      try {
        for (const bg of newUniqueBackgrounds) {
            await addBackgroundDB(bg);
        }
        setBackgrounds(prev => [...newUniqueBackgrounds.slice().reverse(), ...prev]);
      } catch (error) {
        console.error("Failed to import backgrounds to IndexedDB", error);
      }
    }
  }, [backgrounds]);


  const updateBackground = useCallback(async (backgroundId: string, updates: Partial<Pick<Background, 'name'>>) => {
    const backgroundToUpdate = backgrounds.find(bg => bg.id === backgroundId);
    if (!backgroundToUpdate) return;
    
    const updatedBackground = { ...backgroundToUpdate, ...updates };

    try {
      await updateBackgroundDB(updatedBackground);
      setBackgrounds(prev => prev.map(bg =>
        bg.id === backgroundId ? updatedBackground : bg
      ));
    } catch (error) {
      console.error("Failed to update background in IndexedDB", error);
    }
  }, [backgrounds]);

  const removeBackground = useCallback(async (backgroundId: string) => {
    try {
      await deleteBackgroundDB(backgroundId);
      setBackgrounds(prev => prev.filter(bg => bg.id !== backgroundId));
    } catch (error) {
      console.error("Failed to delete background from IndexedDB", error);
    }
  }, []);

  return { backgrounds, addBackground, updateBackground, removeBackground, importBackgrounds };
};

export default useBackgrounds;
