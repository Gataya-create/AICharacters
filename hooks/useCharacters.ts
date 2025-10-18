

import { useState, useEffect, useCallback } from 'react';
import { Character } from '../types';
import { getCharactersDB, addCharacterDB, updateCharacterDB, deleteCharacterDB } from '../services/db';
import { defaultCharacters } from '../data/defaultCharacters';

const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        let storedCharacters = await getCharactersDB();
        
        if (storedCharacters.length === 0) {
          // If the library is empty, add default characters
          const defaultCharsWithIds: Character[] = defaultCharacters.map((char, index) => ({
            ...char,
            id: `default_${Date.now()}_${index}`
          }));

          for (const char of defaultCharsWithIds) {
            await addCharacterDB(char);
          }
          storedCharacters = await getCharactersDB();
        }

        setCharacters(storedCharacters);
      } catch (error) {
        console.error("Failed to load characters from IndexedDB", error);
      }
    };
    
    loadCharacters();
  }, []);

  const addCharacter = useCallback(async (character: Omit<Character, 'id'>) => {
    try {
      const newCharacter: Character = {
        ...character,
        id: `char_${Date.now()}`
      };
      await addCharacterDB(newCharacter);
      setCharacters(prev => [newCharacter, ...prev]);
    } catch (error) {
      console.error("Failed to save character to IndexedDB", error);
    }
  }, []);

  const importCharacters = useCallback(async (importedCharacters: Character[]) => {
    const validCharacters = importedCharacters.filter(c =>
      c.id && typeof c.id === 'string' &&
      c.name && typeof c.name === 'string' &&
      c.imageUrl && typeof c.imageUrl === 'string' &&
      c.mimeType && typeof c.mimeType === 'string'
    );

    const existingIds = new Set(characters.map(c => c.id));
    const newUniqueCharacters = validCharacters.filter(c => !existingIds.has(c.id));
    
    if (newUniqueCharacters.length > 0) {
      try {
        // Add new characters to DB
        for (const char of newUniqueCharacters) {
            await addCharacterDB(char);
        }
        // Prepend to the local state to show them at the top of the list
        setCharacters(prev => [...newUniqueCharacters.slice().reverse(), ...prev]);
      } catch (error) {
        console.error("Failed to import characters to IndexedDB", error);
      }
    }
  }, [characters]);


  const updateCharacter = useCallback(async (characterId: string, updates: Partial<Pick<Character, 'name'>>) => {
    const characterToUpdate = characters.find(char => char.id === characterId);
    if (!characterToUpdate) return;
    
    const updatedCharacter = { ...characterToUpdate, ...updates };

    try {
      await updateCharacterDB(updatedCharacter);
      setCharacters(prev => prev.map(char =>
        char.id === characterId ? updatedCharacter : char
      ));
    } catch (error) {
      console.error("Failed to update character in IndexedDB", error);
    }
  }, [characters]);

  const removeCharacter = useCallback(async (characterId: string) => {
    try {
      await deleteCharacterDB(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
    // FIX: Added curly braces to the catch block to fix a syntax error.
    } catch (error) {
      console.error("Failed to delete character from IndexedDB", error);
    }
  }, []);

  return { characters, addCharacter, updateCharacter, removeCharacter, importCharacters };
};

export default useCharacters;