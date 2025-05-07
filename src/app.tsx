import {
  Rows,
  Text,
  FileInput,
  SegmentedControl,
  Button,
  ProgressBar,
  Alert,
  FormField,
  FileInputItem,
  Title,
  Box,
  ReloadIcon,
  Badge,
  Checkbox,
  Slider,
} from "@canva/app-ui-kit";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type {
  ContentDraft,
  ImageRef,
  ImageElementAtPoint
} from "@canva/design";
import { addElementAtPoint, selection } from "@canva/design";
import { useMutation } from "@tanstack/react-query";
import styles from "styles/components.css";
import type { ImageMimeType } from "@canva/asset";
import { getTemporaryUrl, upload } from "@canva/asset";
import ReactCompareImage from "react-compare-image";

const maxImageSize = 2500 * 2500 * 2;
async function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

async function getImagePixels(file: Blob) {
  return new Promise<{ pixels: number; width: number; height: number }>(
    (resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          pixels: img.width * img.height,
          width: img.width,
          height: img.height,
        });
      };
      img.src = URL.createObjectURL(file);
    }
  );
}

async function readCanvaNativeImageURL(url: string): Promise<File> {
  const res = await fetch(url);
  const formatMatch = url.match(/format:([A-Z]+)/);
  const ext = formatMatch ? formatMatch[1].toLowerCase() : "png";
  return new File([await res.blob()], `selected-image.${ext}`, {
    type: `image/${ext}`,
  });
}

// 定义防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 使用React.memo包装App组件
export const App = React.memo(() => {
  const [[file], setFiles] = useState<File[]>([]);
  const [imageSourceType, setImageSourceType] = useState<
    "upload" | "content" | "unknown"
  >("unknown");
  const [contentDraft, setContentDraft] = useState<ContentDraft<{
    ref: ImageRef;
  }> | null>(null);
  const [enlargeFactor, setEnlargeFactor] = useState("2");
  const [originImageURL, setOriginImageURL] = useState("");
  const [imagePixels, setImagePixels] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasSelect, setHasSelect] = useState(false);

  // 添加新状态：翻转和透明度
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [opacity, setOpacity] = useState(100); // 默认为100%不透明
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // 添加小屏幕检测
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // 创建缓存图像对象引用
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processingRef = useRef(false);
  const settingsRef = useRef({ flipHorizontal, flipVertical, opacity, enlargeFactor });

  // 更新设置参考以避免闭包问题
  settingsRef.current = { flipHorizontal, flipVertical, opacity, enlargeFactor };

  // 检测小屏幕
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 480);
    };

    // 初始检查
    checkScreenSize();

    // 添加resize监听
    window.addEventListener('resize', checkScreenSize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 预加载图像以加快处理速度
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

  // 使用requestAnimationFrame实现更流畅的图像变换
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
  }, []);

  // 防抖处理翻转和透明度变化
  const handleFlipHorizontal = useCallback((value: boolean) => {
    setFlipHorizontal(value);
    setTimeout(updateImagePreview, 0);
  }, [updateImagePreview]);

  const handleFlipVertical = useCallback((value: boolean) => {
    setFlipVertical(value);
    setTimeout(updateImagePreview, 0);
  }, [updateImagePreview]);

  // 使用防抖处理透明度变化，频繁调整时减少渲染次数
  const debouncedOpacityChange = useCallback(
    debounce((value: number) => {
      setOpacity(value);
      setTimeout(updateImagePreview, 0);
    }, 10),
    [updateImagePreview]
  );

  const handleOpacityChange = useCallback((value: number) => {
    // 立即更新UI值以保持响应性，但延迟处理图像
    setOpacity(value);
    debouncedOpacityChange(value);
  }, [debouncedOpacityChange]);

  const {
    data: enlargedData,
    mutateAsync,
    isPending: uploading,
    error: processImageError,
    reset: resetProcessImage,
  } = useMutation({
    mutationFn: async ({
      file,
      enlargeFactor,
    }: {
      file: File;
      enlargeFactor: string;
    }) => {
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
          // send form data via multipart/form-data
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
        return { url: await fileToDataUrl(file2), file: file2 };
      } catch (e) {
        if (e instanceof Error && e.message === "Failed to fetch") {
          throw new Error("Failed to connect to server, please try again");
        }
      }
    },
  });
  const enlargedUrl = enlargedData?.url;

  const stateRef = useRef({ imageSourceType, uploading, enlargedUrl });

  stateRef.current = {
    imageSourceType,
    uploading,
    enlargedUrl,
  };

  useEffect(() => {
    return selection.registerOnChange({
      scope: "image",
      async onChange(event) {
        const draft = await event.read();
        const ref = draft.contents[0]?.ref;
        setHasSelect(!!ref);
        const { imageSourceType, enlargedUrl, uploading } = stateRef.current;
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
          resetData();
        }
      },
    });
  }, []);

  useEffect(() => {
    if (!file || !FileReader) {
      return;
    }

    fileToDataUrl(file).then(setOriginImageURL);
    getImagePixels(file).then(({ pixels }) => setImagePixels(pixels));
  }, [file]);

  const {
    mutate: acceptImage,
    reset: resetAcceptImage,
    data: acceptResult,
    error
  } = useMutation({
    mutationKey: [],
    mutationFn: async ({ enlargedUrl, file, hasSelect }: {
      enlargedUrl: string,
      file: File,
      hasSelect: boolean
    }) => {
      if (
        contentDraft?.contents.length &&
        imageSourceType === "content" && hasSelect) {
        const asset = await upload({
          type: 'image',
          url: enlargedUrl,
          thumbnailUrl: enlargedUrl,
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
                dataUrl: enlargedUrl,
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

  const enlargeFactorOptions = useMemo(() => {
    return [
      { value: "2", label: "2X", disabled: imagePixels * 2 > maxImageSize },
      { value: "3", label: "3X", disabled: imagePixels * 3 > maxImageSize },
      { value: "4", label: "4X", disabled: imagePixels * 4 > maxImageSize },
      { value: "8", label: "8X", disabled: imagePixels * 8 > maxImageSize },
    ];
  }, [originImageURL, imagePixels]);

  const resetData = useCallback(() => {
    setFiles([]);
    setEnlargeFactor("2");
    setOriginImageURL("");
    resetProcessImage();
    setImageSourceType("unknown");
    resetAcceptImage();
    // 重置镜像翻转状态
    setFlipHorizontal(false);
    setFlipVertical(false);
    setOpacity(100);
    setProcessedImageUrl('');
    setPreviewImageUrl('');
    // 清除缓存
    if (imageObjRef.current) {
      URL.revokeObjectURL(imageObjRef.current.src);
      imageObjRef.current = null;
    }
    canvasRef.current = null;
  }, [resetProcessImage, resetAcceptImage]);

  const isPixelExceeded = enlargeFactorOptions.every(
    (option) => option.disabled
  );

  const isFileExceeded = file?.size > 1024 * 1024 * 5; // 5MB

  // 处理放大因子变化
  const handleEnlargeFactorChange = useCallback((value: string) => {
    setEnlargeFactor(value);
    settingsRef.current.enlargeFactor = value;
  }, []);

  const processImage = useCallback(() => {
    if (!previewImageUrl) return;
    setProcessedImageUrl(previewImageUrl);
  }, [previewImageUrl]);

  const applyProcessedImage = useCallback(() => {
    if (!processedImageUrl) return;

    // 使用setTimeout解决MobX响应式上下文问题
    setTimeout(async () => {
      try {
        const response = await fetch(processedImageUrl);
        const blob = await response.blob();
        const processedFile = new File([blob], file?.name || 'processed-image.png', {
          type: 'image/png'
        });

        if (contentDraft?.contents.length && imageSourceType === "content" && hasSelect) {
          const asset = await upload({
            type: 'image',
            url: processedImageUrl,
            thumbnailUrl: processedImageUrl,
            mimeType: 'image/png' as ImageMimeType,
            parentRef: contentDraft.contents[0].ref,
            aiDisclosure: 'app_generated'
          });

          contentDraft.contents[0].ref = asset.ref;
          await contentDraft.save();
          resetAcceptImage();
        } else {
          await new Promise<void>((resolve) => {
            setTimeout(async () => {
              try {
                await addElementAtPoint({
                  type: 'image',
                  dataUrl: processedImageUrl,
                } as ImageElementAtPoint);
                resolve();
              } catch (e) {
                console.error('Error adding element:', e);
                resolve();
              }
            }, 0);
          });
          resetAcceptImage();
        }
      } catch (error) {
        console.error('Error applying processed image:', error);
      }
    }, 0);
  }, [processedImageUrl, file, contentDraft, imageSourceType, hasSelect, resetAcceptImage]);

  if (uploading) {
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        display="flex"
        className={styles.scrollContainer}
        paddingEnd={isSmallScreen ? "1u" : "2u"}
      >
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
          <Title size="small" alignment="center">
            Generating your image
          </Title>
          <ProgressBar value={uploadProgress} />
          <Text alignment="center" size="small" tone="tertiary">
            Please wait, this should only take a few moments
          </Text>
          <Button onClick={resetData} variant="secondary">
            Cancel
          </Button>
        </Rows>
      </Box>
    );
  }

  // 主UI渲染
  return (
    <div className={styles.scrollContainer}>
      {enlargedUrl ? (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
          <>
            <Rows spacing="1u">
              {!!acceptResult && (
                <Alert tone="positive"
                  onDismiss={resetAcceptImage}
                >
                  <Text variant="bold">
                    {acceptResult === "added"
                      ? "Image added to design"
                      : "Image replaced"}
                  </Text>
                </Alert>
              )}

              <Text variant="bold" size="medium">
                Preview
              </Text>

              <div className={styles.imageCompareContainer}>
                <ReactCompareImage
                  sliderLineColor=""
                  leftImage={originImageURL}
                  rightImage={enlargedUrl || ''}
                />
              </div>
            </Rows>

            <Rows spacing="1u">
              <Button
                variant="primary"
                onClick={() => {
                  // 使用setTimeout解决响应式上下文问题
                  setTimeout(() => {
                    acceptImage({ enlargedUrl, file, hasSelect });
                  }, 0);
                }}
              >
                {imageSourceType === "upload" || !hasSelect
                  ? "Add to design"
                  : "Replace"}
              </Button>
              <Button variant="secondary" onClick={resetData} icon={ReloadIcon}>
                Go back
              </Button>
            </Rows>
          </>
        </Rows>
      ) : processedImageUrl ? (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
          <>
            <Rows spacing="1u">
              {!!acceptResult && (
                <Alert tone="positive" onDismiss={resetAcceptImage}>
                  <Text variant="bold">
                    {acceptResult === "added"
                      ? "Image added to design"
                      : "Image replaced"}
                  </Text>
                </Alert>
              )}

              <Text variant="bold" size="medium">
                Preview
              </Text>

              <div className={styles.imagePreviewContainer}>
                <img src={processedImageUrl} className={styles.processedImage} alt="Processed" />
              </div>
            </Rows>

            <Rows spacing="1u">
              <Button variant="primary" onClick={applyProcessedImage}>
                {imageSourceType === "upload" || !hasSelect
                  ? "Add to design"
                  : "Replace"}
              </Button>
              <Button variant="secondary" onClick={resetData} icon={ReloadIcon}>
                Go back
              </Button>
            </Rows>
          </>
        </Rows>
      ) : (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
          <>
            <FormField
              description={
                originImageURL
                  ? ""
                  : "Upload an image or select one in your design to edit"
              }
              label="Original image"
              control={(props) =>
                originImageURL ? (
                  <>
                    {/* eslint-disable-next-line react/forbid-elements */}
                    <img src={previewImageUrl || originImageURL} className={styles.originImage} />

                    {imageSourceType === "upload" && (
                      <FileInputItem
                        onDeleteClick={resetData}
                        label={file?.name}
                      />
                    )}
                  </>
                ) : (
                  <FileInput
                    {...props}
                    accept={[
                      "image/png",
                      "image/jpeg",
                      "image/jpg",
                      "image/webp",
                    ]}
                    stretchButton
                    onDropAcceptedFiles={(files) => {
                      setImageSourceType("upload");
                      setFiles(files);
                    }}
                  />
                )
              }
            />

            {!!file && (
              <>
                <FormField
                  label="翻转"
                  control={() => (
                    <Rows spacing={isSmallScreen ? "0.5u" : "0"}>
                      <Box display="flex" flexDirection="row" alignItems="center">
                        <Checkbox
                          checked={flipHorizontal}
                          onChange={() => handleFlipHorizontal(!flipHorizontal)}
                          label={isSmallScreen ? "水平" : "水平翻转"}
                        />
                      </Box>
                      <Box display="flex" flexDirection="row" alignItems="center">
                        <Checkbox
                          checked={flipVertical}
                          onChange={() => handleFlipVertical(!flipVertical)}
                          label={isSmallScreen ? "垂直" : "垂直翻转"}
                        />
                      </Box>
                    </Rows>
                  )}
                />

                <FormField
                  label="透明度"
                  control={() => (
                    <Slider
                      min={0}
                      max={100}
                      value={opacity}
                      onChange={handleOpacityChange}
                    />
                  )}
                />

                <FormField
                  label="放大比例"
                  control={(props) => (
                    <SegmentedControl
                      {...props}
                      defaultValue="2"
                      value={enlargeFactor}
                      onChange={handleEnlargeFactorChange}
                      options={enlargeFactorOptions}
                    />
                  )}
                />

                <Rows spacing={isSmallScreen ? "0.5u" : "1u"}>
                  <Button
                    stretch
                    variant="primary"
                    type="submit"
                    disabled={!file}
                    onClick={processImage}
                  >
                    {isSmallScreen ? "应用" : "应用效果"}
                  </Button>

                  <Button
                    stretch
                    variant="secondary"
                    type="submit"
                    disabled={!file || isPixelExceeded || isFileExceeded}
                    onClick={() => {
                      // 使用setTimeout解决响应式上下文问题
                      setTimeout(() => {
                        mutateAsync({ file, enlargeFactor });
                      }, 0);
                    }}
                  >
                    {isSmallScreen ? "放大" : "生成放大图像"}
                  </Button>
                </Rows>

                {(isPixelExceeded || isFileExceeded) && (
                  <Alert tone="critical">
                    此文件太大。请选择小于2500px x 2500px或5MB的图像。
                  </Alert>
                )}
              </>
            )}

            {processImageError && (
              <Alert tone="critical">{processImageError.message}</Alert>
            )}
          </>
        </Rows>
      )}
    </div>
  );
});
