import React from 'react';
import { FileInput, FileInputItem, FormField } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import styles from "styles/components.css";

// 图像上传组件
const ImageUploader: React.FC = () => {
    const {
        file,
        originImageURL,
        previewImageUrl,
        imageSourceType,
        setFiles,
        setImageSourceType,
        resetState,
    } = useImageStore();

    return (
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
                                onDeleteClick={resetState}
                                label={file?.name || "Image file"}
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
    );
};

export default ImageUploader; 