import { useState } from "react";

/**
 * Builds Cloudinary responsive URLs with automatic format & quality negotiation
 */
const buildCloudinarySrc = (url, width) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  const parts = url.split("/upload/");
  const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return `${parts[0]}/upload/${transform}/${parts[1]}`;
};

const buildSrcSet = (url, widths = [320, 480, 640, 768, 1024, 1280]) => {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return undefined;
  }
  return widths.map((w) => `${buildCloudinarySrc(url, w)} ${w}w`).join(", ");
};

export const OptimizedImage = ({
  src,
  alt = "",
  width,
  height,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  fallback = "/logo-icon-transparent.png",
  style = {},
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const finalSrc = hasError ? fallback : buildCloudinarySrc(src);
  const srcSet = hasError ? undefined : buildSrcSet(src);

  return (
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-90"
      }`}
      style={{
        ...style,
        ...(width && height ? { aspectRatio: `${width}/${height}` } : {}),
      }}
      {...props}
    />
  );
};
