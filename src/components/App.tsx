import React from 'react';
import { useImageStore } from '../store/imageStore';
import { useCanvaIntegration } from '../hooks/useCanvaIntegration';
import { useResponsive } from '../hooks/useResponsive';
import ImageEditor from './ImageEditor';
import EnlargedImageView from './EnlargedImageView';
import ProcessedImageView from './ProcessedImageView';
import LoadingView from './LoadingView';
import styles from "styles/components.css";

// 主应用组件
const App: React.FC = React.memo(() => {
    const {
        uploading,
        enlargedUrl,
        processedImageUrl,
    } = useImageStore();

    // 初始化Canva集成
    useCanvaIntegration();

    // 初始化响应式设计
    useResponsive();

    if (uploading) {
        return <LoadingView />;
    }

    return (
        <div className={styles.scrollContainer}>
            {enlargedUrl ? (
                <EnlargedImageView />
            ) : processedImageUrl ? (
                <ProcessedImageView />
            ) : (
                <ImageEditor />
            )}
        </div>
    );
});

export default App; 