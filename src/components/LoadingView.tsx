import React from 'react';
import { Box, Button, ProgressBar, Rows, Text, Title } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import styles from "styles/components.css";

// 加载状态组件
const LoadingView: React.FC = () => {
    const {
        uploadProgress,
        isSmallScreen,
        resetState,
    } = useImageStore();

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
                <Button onClick={resetState} variant="secondary">
                    Cancel
                </Button>
            </Rows>
        </Box>
    );
};

export default LoadingView; 