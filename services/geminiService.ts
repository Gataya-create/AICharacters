
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Character, Background } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const imageModel = 'gemini-2.5-flash-image';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType,
    },
  };
};

export const generateCharacter = async (prompt: string, style: string): Promise<{ url: string, mimeType: string }> => {
  const fullPrompt = `Create a full-body character portrait in a ${style} style, based on this description: "${prompt}". The background should be neutral and simple (e.g., light gray).`;
  
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.9,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return { url: `data:${mimeType};base64,${base64ImageBytes}`, mimeType };
    }
  }

  throw new Error("Image generation failed or no image data returned.");
};

export const generateBackground = async (prompt: string, style: string, aspectRatio: string): Promise<{ url: string, mimeType: string }> => {
  const fullPrompt = `Create a high-quality, detailed background scene in a ${style} style, based on this description: "${prompt}". The image should not contain any characters or prominent figures. The final image must have a ${aspectRatio} aspect ratio.`;
  
  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.9,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return { url: `data:${mimeType};base64,${base64ImageBytes}`, mimeType };
    }
  }

  throw new Error("Background generation failed or no image data returned.");
};


export const generateCharacterVariations = async (originalCharacter: Character, count: number = 3): Promise<{ url: string, mimeType: string }[]> => {
  const originalImagePart = fileToGenerativePart(originalCharacter.imageUrl, originalCharacter.mimeType);
  const textPrompt = `Generate a character portrait that is a slight variation of the provided image. Maintain the same art style, core facial features, and overall identity. Introduce a subtle change in the character's facial expression or pose. The background must remain simple and neutral, similar to the original. Do not add or change clothing or accessories.`;

  const generationPromises = Array(count).fill(0).map(() => 
    ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [originalImagePart, { text: textPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
        temperature: 0.7,
        seed: Math.floor(Math.random() * 1000000),
      },
    })
  );

  const responses = await Promise.all(generationPromises);

  const variations = responses.map(response => {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return { url: `data:${mimeType};base64,${base64ImageBytes}`, mimeType };
      }
    }
    return null;
  }).filter((v): v is { url: string; mimeType: string; } => v !== null);

  if (variations.length === 0) {
      throw new Error("Character variation generation failed to produce any images.");
  }
  
  return variations;
};

export const restyleCharacter = async (base64Url: string, mimeType: string, style: string): Promise<{ url: string, mimeType: string }> => {
  const imagePart = fileToGenerativePart(base64Url, mimeType);
  const textPrompt = `Recreate the character in the provided image using a '${style}' art style. Faithfully preserve the character's key features, clothing, and pose, but adapt the entire visual presentation to the new style. The background must be simple and neutral.`;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [imagePart, { text: textPrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.9,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const newMimeType = part.inlineData.mimeType;
      return { url: `data:${newMimeType};base64,${base64ImageBytes}`, mimeType: newMimeType };
    }
  }

  throw new Error("Character restyling failed or no image data returned.");
};

export const createScene = async (characters: Character[], background: Background, scenePrompt: string): Promise<{ url: string, mimeType: string }> => {
  const backgroundPart = fileToGenerativePart(background.imageUrl, background.mimeType);
  const characterParts = characters.map(char => fileToGenerativePart(char.imageUrl, char.mimeType));
  
  const textPrompt = `Use the first image provided as the main background. Place the following characters (subsequent images) into the background.
Scene description of character actions: "${scenePrompt}".
Integrate the characters seamlessly into the background, matching the lighting, shadows, and overall art style. The final image must retain the background's original aspect ratio.`;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [backgroundPart, ...characterParts, { text: textPrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.9,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return { url: `data:${mimeType};base64,${base64ImageBytes}`, mimeType };
    }
  }

  throw new Error("Scene generation failed or no image data returned.");
};


export const editImage = async (
  base64Url: string,
  mimeType: string,
  editPrompt: string,
  maskBase64Url?: string // The mask is a base64 data URL
): Promise<{ url: string, mimeType: string }> => {
  const imagePart = fileToGenerativePart(base64Url, mimeType);
  
  const parts: any[] = [imagePart];

  if (maskBase64Url) {
    // Masks should be PNGs to support transparency
    const maskPart = fileToGenerativePart(maskBase64Url, 'image/png');
    parts.push(maskPart);
  }

  const textPrompt = maskBase64Url 
    ? `Using the second image provided as a mask (the colored area is the region to edit), perform the following edit on the first image: "${editPrompt}". Only modify the masked area and blend it seamlessly with the rest of the image.`
    : `Edit the provided image based on this instruction: "${editPrompt}".`;
  
  parts.push({ text: textPrompt });


  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts,
    },
    config: {
      responseModalities: [Modality.IMAGE],
      temperature: 0.5,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const newMimeType = part.inlineData.mimeType;
      return { url: `data:${newMimeType};base64,${base64ImageBytes}`, mimeType: newMimeType };
    }
  }

  throw new Error("Image editing failed or no image data returned.");
};
