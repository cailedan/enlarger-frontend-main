import { useEffect, useRef } from 'react';
import { selection, getTemporaryUrl } from '@canva/design';
import { useImageStore } from '../store/imageStore';
import { readCanvaNativeImageURL, fileToDataUrl, getImagePixels } from '../utils/imageUtils';

// 处理Canva集成的Hook
export function useCanvaIntegration() {
  const {
    file,
    imageSourceType,
    uploading,
    enlargedUrl,
    setFiles,
    setContentDraft,
    setHasSelect,
    setImageSourceType,
    setOriginImageURL,
    setImagePixels,
    resetState,
  } = useImageStore();

  // 使用ref存储状态以在事件回调中访问最新值
  const stateRef = useRef({ imageSourceType, uploading, enlargedUrl });

  // 更新ref中的状态
  useEffect(() => {
    stateRef.current = {
      imageSourceType,
      uploading,
      enlargedUrl,
    };
  }, [imageSourceType, uploading, enlargedUrl]);

  // 监听Canva选择改变事件
  useEffect(() => {
    return selection.registerOnChange({
      scope: "image",
      async onChange(event) {
        const draft = await event.read();
        const ref = draft.contents[0]?.ref;
        setHasSelect(!!ref);
        
        const { imageSourceType, enlargedUrl, uploading } = stateRef.current;
        
        // 如果正在处理或已有图像，则忽略选择变更
        if (imageSourceType === "upload" || enlargedUrl || uploading) {
          return;
        }

        setContentDraft(draft);
        
        if (ref) {
          setImageSourceType("content");
          const { url } = await getTemporaryUrl({
            type: 'image',
            ref,
          });

          const file = await readCanvaNativeImageURL(url);
          setFiles([file]);
        } else if (imageSourceType === "content" && !uploading) {
          resetState();
        }
      },
    });
  }, []);

  // 加载图像数据
  useEffect(() => {
    if (!file || !FileReader) {
      return;
    }

    // 加载图像URL和像素信息
    const loadImageData = async () => {
      const dataUrl = await fileToDataUrl(file);
      setOriginImageURL(dataUrl);
      
      const { pixels } = await getImagePixels(file);
      setImagePixels(pixels);
    };
    
    loadImageData();
  }, [file, setOriginImageURL, setImagePixels]);

  return {
    // 这里可以返回一些额外的方法如果需要
  };
} 