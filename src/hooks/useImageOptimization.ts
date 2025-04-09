import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  blur?: boolean;
  blurAmount?: number;
}

interface OptimizedImageResult {
  src: string;
  srcSet: string;
  loading: 'lazy' | 'eager';
  optimizedSrc: string | null;
  isLoading: boolean;
  error: string | null;
}

const CDN_PARAMS = {
  width: ['w', 'width'],
  height: ['h', 'height'],
  quality: ['q', 'quality'],
  format: ['fm', 'format'],
  blur: ['blur', 'b'],
};

/**
 * A hook for optimizing images with automatic WebP detection
 * and CDN parameter generation
 */
export function useImageOptimization(
  originalSrc: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageResult {
  const [isWebpSupported, setIsWebpSupported] = useState<boolean | null>(null);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for WebP support once on mount
  useEffect(() => {
    const checkWebPSupport = async () => {
      try {
        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        const blob = await fetch(webpData).then(r => r.blob());
        setIsWebpSupported(blob.size > 0);
      } catch (e) {
        console.error('Error checking WebP support:', e);
        setIsWebpSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkWebPSupport();
  }, []);

  // Generate optimized image URL with parameters
  useEffect(() => {
    if (isWebpSupported === null) return;

    try {
      const url = new URL(originalSrc.startsWith('http') ? originalSrc : `https://example.com/${originalSrc}`);
      const isExternalUrl = originalSrc.startsWith('http');
      
      // Set format to WebP if supported, otherwise use specified format or original
      const format = isWebpSupported ? 'webp' : (options.format || 'auto');
      
      // Only add format parameter if it's not 'auto'
      if (format !== 'auto') {
        url.searchParams.set(CDN_PARAMS.format[0], format);
      }
      
      // Add width parameter if specified
      if (options.width) {
        url.searchParams.set(CDN_PARAMS.width[0], options.width.toString());
      }
      
      // Add height parameter if specified
      if (options.height) {
        url.searchParams.set(CDN_PARAMS.height[0], options.height.toString());
      }
      
      // Add quality parameter if specified
      if (options.quality) {
        url.searchParams.set(CDN_PARAMS.quality[0], options.quality.toString());
      }
      
      // Add blur parameter if specified
      if (options.blur && options.blurAmount) {
        url.searchParams.set(CDN_PARAMS.blur[0], options.blurAmount.toString());
      }
      
      setOptimizedSrc(isExternalUrl ? url.toString() : `${url.pathname}${url.search}`);
    } catch (e) {
      console.error('Error optimizing image URL:', e);
      setError('Failed to optimize image');
      setOptimizedSrc(originalSrc);
    } finally {
      setIsLoading(false);
    }
  }, [originalSrc, isWebpSupported, options]);

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!options.width || !optimizedSrc) return '';
    
    const widths = [options.width / 2, options.width, options.width * 2];
    
    return widths
      .map(w => {
        const url = new URL(optimizedSrc.startsWith('http') ? optimizedSrc : `https://example.com/${optimizedSrc}`);
        url.searchParams.set(CDN_PARAMS.width[0], Math.round(w).toString());
        const finalUrl = optimizedSrc.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`;
        return `${finalUrl} ${Math.round(w)}w`;
      })
      .join(', ');
  };

  return {
    src: originalSrc,
    optimizedSrc: optimizedSrc,
    srcSet: generateSrcSet(),
    loading: 'lazy',
    isLoading,
    error,
  };
} 