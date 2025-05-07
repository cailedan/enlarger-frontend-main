import React from 'react';
import { Box, Checkbox, FormField, Rows, SegmentedControl, Slider } from "@canva/app-ui-kit";
import { useImageStore } from '../store/imageStore';
import { useImageProcessing } from '../hooks/useImageProcessing';
import { MAX_IMAGE_SIZE } from '../utils/imageUtils';

// 图像控制组件
const ImageControls: React.FC = () => {
    const {
        file,
        imageState,
        imagePixels,
        isSmallScreen,
    } = useImageStore();

    const {
        handleFlipHorizontal,
        handleFlipVertical,
        handleOpacityChange,
        handleEnlargeFactorChange,
    } = useImageProcessing();

    // 计算放大因子选项
    const enlargeFactorOptions = React.useMemo(() => {
        return [
            { value: "2", label: "2X", disabled: imagePixels * 2 > MAX_IMAGE_SIZE },
            { value: "3", label: "3X", disabled: imagePixels * 3 > MAX_IMAGE_SIZE },
            { value: "4", label: "4X", disabled: imagePixels * 4 > MAX_IMAGE_SIZE },
            { value: "8", label: "8X", disabled: imagePixels * 8 > MAX_IMAGE_SIZE },
        ];
    }, [imagePixels]);

    const { flipHorizontal, flipVertical, opacity, enlargeFactor } = imageState;

    if (!file) return null;

    return (
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
        </>
    );
};

export default ImageControls; 