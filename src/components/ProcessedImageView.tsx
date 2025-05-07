import React from 'react';
import { Alert, Button, ReloadIcon, Rows, Text } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import { useImageUpload } from '../hooks/useImageUpload';
import styles from "styles/components.css";

// 处理后图像预览组件
const ProcessedImageView: React.FC = () => {
    const {
        processedImageUrl,
        acceptResult,
        isSmallScreen,
        imageSourceType,
        hasSelect,
        resetState,
    } = useImageStore();

    const { applyProcessedImage, resetApplyImage } = useImageUpload();

    if (!processedImageUrl) return null;

    return (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
            <>
                <Rows spacing="1u">
                    {!!acceptResult && (
                        <Alert tone="positive" onDismiss={resetApplyImage}>
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
                    <Button variant="secondary" onClick={resetState} icon={ReloadIcon}>
                        Go back
                    </Button>
                </Rows>
            </>
        </Rows>
    );
};

export default ProcessedImageView; 