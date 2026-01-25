import React, { createContext, useState, useContext, useEffect } from 'react';

const WallpaperContext = createContext(null);

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};

export const WallpaperProvider = ({ children }) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(() => {
    return localStorage.getItem('app-wallpaper') || 'default';
  });

  useEffect(() => {
    localStorage.setItem('app-wallpaper', currentWallpaper);
  }, [currentWallpaper]);

  return (
    <WallpaperContext.Provider value={{ currentWallpaper, setCurrentWallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};
