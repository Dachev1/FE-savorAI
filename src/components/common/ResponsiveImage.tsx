import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  className?: string;
  loadingStrategy?: 'lazy' | 'eager';
  onLoad?: () => void;
  placeholderColor?: string;
  aspectRatio?: string;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  fallbackSrc,
  alt,
  sizes = '100vw',
  className = '',
  loadingStrategy = 'lazy',
  onLoad,
  placeholderColor = '#f5f5f7',
  aspectRatio = 'auto',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const isWebpSupported = useRef<boolean | null>(null);
  const baseClassName = "transition-opacity duration-300 w-full h-full object-cover";

  useEffect(() => {
    if (isWebpSupported.current !== null) return;
    
    const checkWebpSupport = async () => {
      try {
        const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
        const blob = await fetch(webpData).then(r => r.blob());
        isWebpSupported.current = blob.size > 0;
      } catch (e) {
        isWebpSupported.current = false;
      }
    };
    
    checkWebpSupport();
  }, []);

  useEffect(() => {
    if (loadingStrategy === 'eager') {
      return;
    }

    if (!observer.current && imgRef.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && imgRef.current) {
              imgRef.current.src = src;
              observer.current?.unobserve(imgRef.current);
              observer.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '200px 0px',
          threshold: 0.01
        }
      );
      
      observer.current.observe(imgRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [src, loadingStrategy]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  const handleImageError = () => {
    setError(true);
    setIsLoaded(true);
  };

  const getSrcWithFormat = () => {
    if (isWebpSupported.current && !src.endsWith('.webp')) {
      if (src.match(/\.(jpg|jpeg|png)$/i)) {
        return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
      return `${src}${src.includes('?') ? '&' : '?'}format=webp`;
    }
    return src;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        backgroundColor: placeholderColor,
        aspectRatio: aspectRatio,
      }}
    >
      <img
        ref={imgRef}
        src={loadingStrategy === 'eager' ? getSrcWithFormat() : undefined}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${baseClassName} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={loadingStrategy}
        decoding="async"
        {...props}
      />
      
      {error && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt}
          className={`${baseClassName} absolute top-0 left-0 opacity-100`}
          onLoad={handleImageLoad}
          {...props}
        />
      )}
    </div>
  );
};

export default React.memo(ResponsiveImage); 