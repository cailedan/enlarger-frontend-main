import { ImagePixelInfo } from "../types";

// 将文件转换为DataURL
export async function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// 获取图像像素信息
export async function getImagePixels(file: Blob): Promise<ImagePixelInfo> {
  return new Promise<ImagePixelInfo>((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        pixels: img.width * img.height,
        width: img.width,
        height: img.height,
      });
    };
    img.src = URL.createObjectURL(file);
  });
}

// 从Canva原生图像URL读取文件
export async function readCanvaNativeImageURL(url: string): Promise<File> {
  const res = await fetch(url);
  const formatMatch = url.match(/format:([A-Z]+)/);
  const ext = formatMatch ? formatMatch[1].toLowerCase() : "png";
  return new File([await res.blob()], `selected-image.${ext}`, {
    type: `image/${ext}`,
  });
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 图像最大尺寸常量
export const MAX_IMAGE_SIZE = 2500 * 2500 * 2;
export const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB 