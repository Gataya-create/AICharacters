import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, RefObject } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { BrushIcon, EraserIcon, ClearIcon } from './icons';

interface MaskEditorProps {
  imageUrl: string;
}

export interface MaskEditorHandles {
  getMaskAsBase64: () => string | null;
  clearMask: () => void;
  setBrushSize: (size: number) => void;
  setMode: (mode: 'draw' | 'erase') => void;
}

const MaskEditorComponent = forwardRef<MaskEditorHandles, MaskEditorProps>(({ imageUrl }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    image.onload = () => {
      const container = containerRef.current;
      const imageCanvas = imageCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      if (!container || !imageCanvas || !drawingCanvas) return;

      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      const imageAspectRatio = image.width / image.height;
      const containerAspectRatio = containerWidth / containerHeight;
      
      let canvasWidth, canvasHeight;
      if (imageAspectRatio > containerAspectRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / imageAspectRatio;
      } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * imageAspectRatio;
      }

      imageCanvas.width = canvasWidth;
      imageCanvas.height = canvasHeight;
      drawingCanvas.width = canvasWidth;
      drawingCanvas.height = canvasHeight;

      const ctx = imageCanvas.getContext('2d');
      ctx?.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    };
  }, [imageUrl]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const touch = (e as React.TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    lastPos.current = coords;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoords(e);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !coords || !lastPos.current) return;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (mode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    }
    
    ctx.stroke();
    lastPos.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearMask = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  useImperativeHandle(ref, () => ({
    getMaskAsBase64: () => {
      const canvas = drawingCanvasRef.current;
      if (!canvas) return null;
      // Check if mask is empty
      const ctx = canvas.getContext('2d');
      if(!ctx) return null;
      const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      const isEmpty = !pixelBuffer.some(color => color !== 0);

      if (isEmpty) return null;
      
      return canvas.toDataURL('image/png');
    },
    clearMask,
    setBrushSize,
    setMode,
  }));

  return (
    <div ref={containerRef} className="w-full h-full aspect-auto flex items-center justify-center relative touch-none">
      <canvas ref={imageCanvasRef} className="absolute inset-0" />
      <canvas
        ref={drawingCanvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});


const Controls: React.FC<{ editorRef: RefObject<MaskEditorHandles> }> = ({ editorRef }) => {
    const { t } = useTranslation();
    const [brushSize, setBrushSizeState] = useState(30);
    const [mode, setModeState] = useState<'draw' | 'erase'>('draw');

    const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = Number(e.target.value);
        setBrushSizeState(size);
        editorRef.current?.setBrushSize(size);
    };

    const handleModeChange = (newMode: 'draw' | 'erase') => {
        setModeState(newMode);
        editorRef.current?.setMode(newMode);
    };

    const handleClear = () => {
        editorRef.current?.clearMask();
    };

    return (
         <div>
            <label htmlFor="brushSize" className="block text-sm font-medium text-gray-300 mb-2">{t('brushSizeLabel')}: {brushSize}</label>
            <input
                type="range"
                id="brushSize"
                min="5"
                max="100"
                value={brushSize}
                onChange={handleBrushSizeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex space-x-2 mt-4">
                <button
                    onClick={() => handleModeChange('draw')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${mode === 'draw' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <BrushIcon /> {t('drawButton')}
                </button>
                <button
                    onClick={() => handleModeChange('erase')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${mode === 'erase' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <EraserIcon className="h-4 w-4" /> {t('eraseButton')}
                </button>
                 <button
                    onClick={handleClear}
                    title={t('clearMaskButton')}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                    <ClearIcon className="h-5 w-5"/>
                </button>
            </div>
        </div>
    );
};

const MaskEditor = Object.assign(MaskEditorComponent, { Controls });

export default MaskEditor;
