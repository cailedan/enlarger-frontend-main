import React from 'react';
import { Rows } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import ImageUploader from './ImageUploader';
import ImageControls from './ImageControls';
import ActionButtons from './ActionButtons';
import ErrorMessage from './ErrorMessage';
import styles from "styles/components.css";

// 图像编辑器组件
const ImageEditor: React.FC = () => {
    const {
        file,
        isSmallScreen,
    } = useImageStore();

    return (
        <Rows spacing={isSmallScreen ? "1u" : "2u"}>
            <>
                <ImageUploader />

                {!!file && (
                    <>
                        <ImageControls />
                        <ActionButtons />
                        <ErrorMessage />
                    </>
                )}
            </>
        </Rows>
    );
};

export default ImageEditor; 