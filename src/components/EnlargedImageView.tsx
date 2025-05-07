import React from 'react';
import { Alert, Button, ReloadIcon, Rows, Text } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import { useImageUpload } from '../hooks/useImageUpload';
import ReactCompareImage from "react-compare-image";
import styles from "styles/components.css";

// 放大后图像预览组件
const EnlargedImageView: React.FC = () => {
    const {
        originImageURL,
        enlargedUrl,
        acceptResult,
        isSmallScreen,
        imageSourceType,
        hasSelect,
        resetState,
    } = useImageStore();

    const { applyEnlargedImage, resetApplyImage } = useImageUpload();

    if (!enlargedUrl) return null;

    return (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
            <>
                <Rows spacing="1u">
                    {!!acceptResult && (
                        <Alert tone="positive"
                            onDismiss={resetApplyImage}
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
                            setTimeout(() => {
                                applyEnlargedImage(enlargedUrl);
                            }, 0);
                        }}
                    >
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

export default EnlargedImageView; 