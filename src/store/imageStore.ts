import { create } from 'zustand';
import { EnlargedData, ImageState, ImageSourceType, ProcessResultType } from '../types';
import { MAX_IMAGE_SIZE } from '../utils/imageUtils';

interface ImageStoreState {
  // 图像状态
  file: File | null;
  files: File[];
  originImageURL: string;
  previewImageUrl: string;
  processedImageUrl: string;
  enlargedUrl: string | null;
  enlargedData: EnlargedData | null;
  imageSourceType: ImageSourceType;
  imagePixels: number;
  
  // 处理状态
  uploadProgress: number;
  uploading: boolean;
  hasSelect: boolean;
  processImageError: Error | null;
  acceptResult: ProcessResultType;
  
  // 图像设置
  imageState: ImageState;
  
  // UI状态
  isSmallScreen: boolean;
  
  // 操作
  setFiles: (files: File[]) => void;
  setOriginImageURL: (url: string) => void;
  setPreviewImageUrl: (url: string) => void;
  setProcessedImageUrl: (url: string) => void;
  setEnlargedData: (data: EnlargedData | null) => void;
  setImageSourceType: (type: ImageSourceType) => void;
  setImagePixels: (pixels: number) => void;
  setUploadProgress: (progress: number) => void;
  setUploading: (uploading: boolean) => void;
  setHasSelect: (hasSelect: boolean) => void;
  setProcessImageError: (error: Error | null) => void;
  setAcceptResult: (result: ProcessResultType) => void;
  updateImageState: (updates: Partial<ImageState>) => void;
  setIsSmallScreen: (isSmall: boolean) => void;
  resetState: () => void;
}

// 默认状态
const defaultImageState: ImageState = {
  flipHorizontal: false,
  flipVertical: false,
  opacity: 100,
  enlargeFactor: '2',
};

export const useImageStore = create<ImageStoreState>((set) => ({
  // 图像状态
  file: null,
  files: [],
  originImageURL: '',
  previewImageUrl: '',
  processedImageUrl: '',
  enlargedUrl: null,
  enlargedData: null,
  imageSourceType: 'unknown',
  imagePixels: 0,
  
  // 处理状态
  uploadProgress: 0,
  uploading: false,
  hasSelect: false,
  processImageError: null,
  acceptResult: null,
  
  // 图像设置
  imageState: { ...defaultImageState },
  
  // UI状态
  isSmallScreen: false,
  
  // 操作
  setFiles: (files) => set((state) => ({ 
    files,
    file: files[0] || null 
  })),
  
  setOriginImageURL: (url) => set({ originImageURL: url }),
  
  setPreviewImageUrl: (url) => set({ previewImageUrl: url }),
  
  setProcessedImageUrl: (url) => set({ processedImageUrl: url }),
  
  setEnlargedData: (data) => set({
    enlargedData: data,
    enlargedUrl: data?.url || null,
  }),
  
  setImageSourceType: (type) => set({ imageSourceType: type }),
  
  setImagePixels: (pixels) => set({ imagePixels: pixels }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setUploading: (uploading) => set({ uploading }),
  
  setHasSelect: (hasSelect) => set({ hasSelect }),
  
  setProcessImageError: (error) => set({ processImageError: error }),
  
  setAcceptResult: (result) => set({ acceptResult: result }),
  
  updateImageState: (updates) => set((state) => ({
    imageState: { ...state.imageState, ...updates }
  })),
  
  setIsSmallScreen: (isSmall) => set({ isSmallScreen: isSmall }),
  
  resetState: () => set({
    file: null,
    files: [],
    originImageURL: '',
    previewImageUrl: '',
    processedImageUrl: '',
    enlargedUrl: null,
    enlargedData: null,
    imageSourceType: 'unknown',
    uploadProgress: 0,
    processImageError: null,
    acceptResult: null,
    imageState: { ...defaultImageState },
  }),
})); 