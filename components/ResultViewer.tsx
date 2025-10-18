import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './Spinner';
import Modal from './Modal';
import { DownloadIcon, EditIcon, BrushIcon, EraserIcon, ClearIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import MaskEditor, { MaskEditorHandles } from './MaskEditor';

interface ResultViewerProps {
  generatedImage: { url: string; mimeType: string; } | null;
  onImageUpdate: (image: { url: string; mimeType: string; }) => void;
  isComposing: boolean;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ generatedImage, onImageUpdate, isComposing }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const maskEditorRef = useRef<MaskEditorHandles>(null);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.url;
    const extension = generatedImage.mimeType.split('/')[1] || 'png';
    link.download = `storyboard_scene.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAiEdit = async () => {
    if (!generatedImage || !editPrompt) return;
    
    setIsEditingLoading(true);
    setEditError('');
    try {
        const maskData = maskEditorRef.current?.getMaskAsBase64();
        const result = await editImage(generatedImage.url, generatedImage.mimeType, editPrompt, maskData);
        onImageUpdate(result);
        setIsEditing(false);
        setEditPrompt('');
    } catch (err) {
        setEditError(t('errorImageEditFailed'));
        console.error(err);
    } finally {
        setIsEditingLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (isEditingLoading) return;
    setIsEditing(false);
    setEditPrompt('');
    setEditError('');
  }


  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg flex flex-col flex-grow">
      <h2 className="text-xl font-semibold mb-4 text-purple-300">{t('resultTitle')}</h2>
      <div className="flex-grow bg-gray-900/50 rounded-md flex items-center justify-center overflow-hidden">
        {isComposing ? (
            <Spinner text={t('generatingSceneResult')}/>
        ) : generatedImage ? (
          <img src={generatedImage.url} alt="Generated Scene" className="max-w-full max-h-full object-contain" />
        ) : (
          <p className="text-gray-500">{t('resultPlaceholder')}</p>
        )}
      </div>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          disabled={!generatedImage || isComposing || isEditingLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          <EditIcon /> {t('aiEditButton')}
        </button>
        <button
          onClick={handleDownload}
          disabled={!generatedImage || isComposing || isEditingLoading}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          <DownloadIcon /> {t('downloadButton')}
        </button>
      </div>

      {isEditing && generatedImage && (
        <Modal title={t('aiEditModalTitle')} onClose={handleCloseModal} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                <MaskEditor ref={maskEditorRef} imageUrl={generatedImage.url} />
              </div>

              <div className="flex flex-col space-y-4">
                  <p className="text-sm text-gray-400">{t('aiEditModalDescription')}</p>
                  
                  <MaskEditor.Controls editorRef={maskEditorRef} />

                  <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder={t('aiEditModalPlaceholder')}
                      className="w-full h-32 p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                      disabled={isEditingLoading}
                  />
                  {editError && <p className="text-red-400 text-sm">{editError}</p>}
                  <div className="flex justify-end space-x-2 pt-4">
                      <button onClick={handleCloseModal} disabled={isEditingLoading} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">{t('cancelButton')}</button>
                      <button onClick={handleAiEdit} disabled={!editPrompt || isEditingLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 rounded-md w-28">
                          {isEditingLoading ? <Spinner /> : t('applyButton')}
                      </button>
                  </div>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default ResultViewer;