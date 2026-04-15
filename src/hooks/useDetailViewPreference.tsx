import { useState, useEffect } from 'react';

type DetailViewStyle = 'classic' | 'enhanced';

export function useDetailViewPreference() {
  const [viewStyle, setViewStyle] = useState<DetailViewStyle>('classic');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('detailViewStyle') as DetailViewStyle | null;
    if (saved) {
      setViewStyle(saved);
    }
    setIsLoaded(true);
  }, []);

  // Save preference to localStorage when changed
  const updateViewStyle = (style: DetailViewStyle) => {
    setViewStyle(style);
    localStorage.setItem('detailViewStyle', style);
  };

  return {
    viewStyle,
    updateViewStyle,
    isLoaded,
  };
}
