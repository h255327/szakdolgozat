import { useState, useEffect } from 'react';

/**
 * Renders an <img> with a CSS placeholder fallback when:
 *   - src is null / undefined / empty string
 *   - the image URL returns a network/HTTP error
 *
 * Props:
 *   src             — image URL (may be null/undefined)
 *   alt             — alt text
 *   imgClassName    — className for the <img>
 *   imgStyle        — style object for the <img>
 *   fallbackClassName — extra class(es) appended to card-img-placeholder
 *   fallbackStyle   — style object for the placeholder div
 *   fallbackIcon    — content rendered inside the placeholder (emoji or node)
 */
function ImgWithFallback({
  src,
  alt,
  imgClassName,
  imgStyle,
  fallbackClassName = '',
  fallbackStyle,
  fallbackIcon,
}) {
  const [error, setError] = useState(false);

  // Reset error flag whenever the image source changes so a new valid URL
  // is not blocked by a previous load failure on the same component instance.
  useEffect(() => { setError(false); }, [src]);

  if (!src || error) {
    return (
      <div
        className={`card-img-placeholder${fallbackClassName ? ` ${fallbackClassName}` : ''}`}
        style={fallbackStyle}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ''}
      className={imgClassName}
      style={imgStyle}
      onError={() => setError(true)}
    />
  );
}

export default ImgWithFallback;
