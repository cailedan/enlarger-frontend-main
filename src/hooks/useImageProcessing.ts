import { useCallback, useEffect, useRef } from 'react';
import { useImageStore } from '../store/imageStore';
import { debounce } from '../utils/imageUtils';
import { ImageState } from '../types';

export function useImageProcessing() {
  const {
    file,
    imageState,
    updateImageState,
    setPreviewImageUrl,
    previewImageUrl,
    setProcessedImageUrl,
  } = useImageStore();

  // 引用对象
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processingRef = useRef(false);
  const settingsRef = useRef<ImageState>(imageState);

  // 更新设置引用以避免闭包问题
  useEffect(() => {
    settingsRef.current = imageState;
  }, [imageState]);

  // 预加载图像
  useEffect(() => {
    if (!file) {
      imageObjRef.current = null;
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      imageObjRef.current = img;
      
      // 初始化canvas
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      
      // 初始预览
      updateImagePreview();
    };
    img.src = URL.createObjectURL(file);
    
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [file]);

  // 使用requestAnimationFrame实现图像变换
  const updateImagePreview = useCallback(() => {
    if (processingRef.current || !imageObjRef.current || !canvasRef.current) return;
    
    processingRef.current = true;
    
    requestAnimationFrame(() => {
      try {
        const img = imageObjRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { flipHorizontal, flipVertical, opacity } = settingsRef.current;
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置透明度
        ctx.globalAlpha = opacity / 100;
        
        // 应用翻转变换
        ctx.save();
        ctx.translate(flipHorizontal ? canvas.width : 0, flipVertical ? canvas.height : 0);
        ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        setPreviewImageUrl(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Error updating preview:', error);
      } finally {
        processingRef.current = false;
      }
    });
  }, [setPreviewImageUrl]);

  // 防抖处理图像变换
  const debouncedOpacityChange = useCallback(
    debounce((value: number) => {
      updateImageState({ opacity: value });
      setTimeout(updateImagePreview, 0);
    }, 10),
    [updateImagePreview, updateImageState]
  );

  // 处理翻转和透明度变化
  const handleFlipHorizontal = useCallback((value: boolean) => {
    updateImageState({ flipHorizontal: value });
    setTimeout(updateImagePreview, 0);
  }, [updateImagePreview, updateImageState]);

  const handleFlipVertical = useCallback((value: boolean) => {
    updateImageState({ flipVertical: value });
    setTimeout(updateImagePreview, 0);
  }, [updateImagePreview, updateImageState]);

  const handleOpacityChange = useCallback((value: number) => {
    // 立即更新UI值，延迟处理图像
    updateImageState({ opacity: value });
    debouncedOpacityChange(value);
  }, [debouncedOpacityChange, updateImageState]);

  const handleEnlargeFactorChange = useCallback((value: string) => {
    updateImageState({ enlargeFactor: value });
  }, [updateImageState]);

  // 应用处理效果
  const processImage = useCallback(() => {
    if (!previewImageUrl) return;
    setProcessedImageUrl(previewImageUrl);
  }, [previewImageUrl, setProcessedImageUrl]);

  // 清理资源
  const cleanup = useCallback(() => {
    if (imageObjRef.current) {
      URL.revokeObjectURL(imageObjRef.current.src);
      imageObjRef.current = null;
    }
    canvasRef.current = null;
  }, []);

  return {
    handleFlipHorizontal,
    handleFlipVertical,
    handleOpacityChange,
    handleEnlargeFactorChange,
    processImage,
    cleanup,
    updateImagePreview,
  };
} 