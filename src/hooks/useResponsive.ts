import { useEffect } from 'react';
import { useImageStore } from '../store/imageStore';

// 处理响应式设计的Hook
export function useResponsive() {
  const { setIsSmallScreen } = useImageStore();

  // 检测小屏幕设备
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
  }, [setIsSmallScreen]);

  return {
    // 这里可以返回一些响应式相关的辅助方法
  };
} 