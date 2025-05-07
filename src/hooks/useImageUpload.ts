import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { addElementAtPoint } from '@canva/design';
import { upload } from '@canva/asset';
import { useImageStore } from '../store/imageStore';
import { fileToDataUrl } from '../utils/imageUtils';
import { EnlargedData, UploadParams } from '../types';
import type { ImageMimeType } from "@canva/asset";
import type { ImageElementAtPoint } from "@canva/design";

// 上传和处理图像的Hook
export function useImageUpload() {
  const {
    file,
    imageState,
    imageSourceType,
    contentDraft,
    hasSelect,
    processedImageUrl,
    setUploadProgress,
    setAcceptResult,
  } = useImageStore();

  // 处理上传和放大图像
  const {
    mutateAsync: enlargeImage,
    isPending: uploading,
    error: processImageError,
    reset: resetProcessImage,
  } = useMutation({
    mutationFn: async ({ file, enlargeFactor }: UploadParams) => {
      const body = new FormData();
      body.append("file", file);
      body.append("enlarge_actor", enlargeFactor);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === 75) {
            clearInterval(interval);
            return prev;
          }
          return Math.min(prev + 1, 75);
        });
      }, 200);

      try {
        const res = await fetch(`${BACKEND_HOST}/enlarge`, {
          method: "POST",
          body,
        });

        setUploadProgress(100);

        if (res.status !== 200) {
          if (res.status === 500) {
            throw new Error("Server error, please try again");
          }
          if (res.status === 504 || res.status === 524) {
            throw new Error("Request timeout, please try again");
          }

          if (res.status === 413) {
            throw new Error(
              "Image too large, please replace with a smaller image"
            );
          }
          throw new Error("Failed to process image:" + res.statusText);
        }
        const file2 = new File([await res.blob()], file.name, {
          type: 'image/png',
        });
        return { url: await fileToDataUrl(file2), file: file2 } as EnlargedData;
      } catch (e) {
        if (e instanceof Error && e.message === "Failed to fetch") {
          throw new Error("Failed to connect to server, please try again");
        }
        throw e;
      }
    },
  });

  // 处理应用图像
  const {
    mutate: applyImage,
    reset: resetApplyImage,
  } = useMutation({
    mutationKey: [],
    mutationFn: async ({ imageUrl }: { imageUrl: string }) => {
      if (
        contentDraft?.contents.length &&
        imageSourceType === "content" && 
        hasSelect
      ) {
        const asset = await upload({
          type: 'image',
          url: imageUrl,
          thumbnailUrl: imageUrl,
          mimeType: 'image/png' as ImageMimeType,
          parentRef: contentDraft.contents[0].ref,
          aiDisclosure: 'app_generated'
        });

        contentDraft.contents[0].ref = asset.ref;
        await contentDraft.save();
        return "replaced";
      } else {
        // 使用setTimeout在下一个事件循环执行，修复响应式上下文问题
        await new Promise<void>((resolve) => {
          setTimeout(async () => {
            try {
              await addElementAtPoint({
                type: 'image',
                dataUrl: imageUrl,
              } as ImageElementAtPoint);
              resolve();
            } catch (e) {
              console.error('Error adding element:', e);
              resolve();
            }
          }, 0);
        });
        return "added";
      }
    },
  });

  // 应用处理后的图像
  const applyProcessedImage = useCallback(() => {
    if (!processedImageUrl) return;
    
    // 使用setTimeout解决MobX响应式上下文问题
    setTimeout(() => {
      applyImage({ imageUrl: processedImageUrl });
    }, 0);
  }, [processedImageUrl, applyImage]);

  // 应用放大后的图像
  const applyEnlargedImage = useCallback((enlargedUrl: string) => {
    // 使用setTimeout解决响应式上下文问题
    setTimeout(() => {
      applyImage({ imageUrl: enlargedUrl });
    }, 0);
  }, [applyImage]);

  // 触发图像放大处理
  const handleEnlargeImage = useCallback(() => {
    if (!file) return;
    
    // 使用setTimeout解决响应式上下文问题
    setTimeout(() => {
      enlargeImage({ 
        file, 
        enlargeFactor: imageState.enlargeFactor 
      });
    }, 0);
  }, [file, imageState.enlargeFactor, enlargeImage]);

  return {
    enlargeImage,
    uploading,
    processImageError,
    resetProcessImage,
    applyImage,
    resetApplyImage,
    applyProcessedImage,
    applyEnlargedImage,
    handleEnlargeImage,
  };
} 