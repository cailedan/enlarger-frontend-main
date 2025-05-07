import React from 'react';
import { Button, Rows } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { useImageUpload } from '../hooks/useImageUpload';
import { MAX_FILE_SIZE } from '../utils/imageUtils';

// 操作按钮组件
const ActionButtons: React.FC = () => {
    const {
        file,
        imagePixels,
        isSmallScreen,
        imageState,
    } = useImageStore();

    const { processImage } = useImageProcessing();
    const { handleEnlargeImage } = useImageUpload();

    // 判断文件大小是否超限
    const isFileExceeded = file && file.size > MAX_FILE_SIZE;

    // 判断像素是否超限
    const isPixelExceeded = React.useMemo(() => {
        const { enlargeFactor } = imageState;
        const factor = Number(enlargeFactor);
        return imagePixels * factor > MAX_FILE_SIZE;
    }, [imagePixels, imageState.enlargeFactor]);

    if (!file) return null;

    return (
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
                onClick={handleEnlargeImage}
            >
                {isSmallScreen ? "放大" : "生成放大图像"}
            </Button>
        </Rows>
    );
};

export default ActionButtons; 