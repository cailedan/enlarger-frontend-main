import type { ContentDraft, ImageRef } from "@canva/design";

// 应用状态接口
export interface ImageState {
  flipHorizontal: boolean;
  flipVertical: boolean;
  opacity: number;
  enlargeFactor: string;
}

// 图像源类型
export type ImageSourceType = "upload" | "content" | "unknown";

// 处理结果类型
export type ProcessResultType = "added" | "replaced" | null;

// 图像像素信息
export interface ImagePixelInfo {
  pixels: number;
  width: number;
  height: number;
}

// 放大选项
export interface EnlargeOption {
  value: string;
  label: string;
  disabled: boolean;
}

// 放大结果
export interface EnlargedData {
  url: string;
  file: File;
}

// 上传参数
export interface UploadParams {
  file: File;
  enlargeFactor: string;
}

// 图像处理上下文
export interface ImageProcessContext {
  imageObjRef: React.RefObject<HTMLImageElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  processingRef: React.RefObject<boolean>;
  settingsRef: React.RefObject<ImageState>;
}

// 应用图像参数
export interface ApplyImageParams {
  enlargedUrl: string;
  file: File;
  hasSelect: boolean;
}

// 应用数据上下文
export interface AppDataContext {
  file: File | null;
  contentDraft: ContentDraft<{ ref: ImageRef }> | null;
  imageSourceType: ImageSourceType;
  hasSelect: boolean;
} 