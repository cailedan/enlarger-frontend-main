import React from 'react';
import { Alert } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import { MAX_FILE_SIZE } from '../utils/imageUtils';

// 错误消息组件
const ErrorMessage: React.FC = () => {
    const {
        file,
        imagePixels,
        imageState,
        processImageError,
    } = useImageStore();

    // 判断文件大小是否超限
    const isFileExceeded = file && file.size > MAX_FILE_SIZE;

    // 判断像素是否超限
    const isPixelExceeded = React.useMemo(() => {
        if (!file) return false;

        const { enlargeFactor } = imageState;
        const factor = Number(enlargeFactor);
        return imagePixels * factor > MAX_FILE_SIZE;
    }, [file, imagePixels, imageState.enlargeFactor]);

    if (!file) return null;

    // 显示处理错误
    if (processImageError) {
        return <Alert tone="critical">{processImageError.message}</Alert>;
    }

    // 显示文件大小或像素超限警告
    if (isFileExceeded || isPixelExceeded) {
        return (
            <Alert tone="critical">
                此文件太大。请选择小于2500px x 2500px或5MB的图像。
            </Alert>
        );
    }

    return null;
};

export default ErrorMessage; 