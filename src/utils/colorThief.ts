import ColorThief from 'colorthief';
import { useEffect, useState } from 'react';

export function useDominantColor(imageUrl: string): string | undefined {
  const [dominantColor, setDominantColor] = useState<string>();

  useEffect(() => {
    const img = new Image();
    const colorThief = new ColorThief();

    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const color = colorThief.getColor(img);
      setDominantColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.25)`);
    };
  }, [imageUrl]);

  return dominantColor;
}
