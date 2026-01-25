import React from 'react';
import { useWallpaper } from '../../context/WallpaperContext';
import { WALLPAPERS } from '../../data/wallpapers';
import './WallpaperBackground.css';

const WallpaperBackground = () => {
  const { currentWallpaper } = useWallpaper();
  
  const wallpaper = WALLPAPERS.find(w => w.id === currentWallpaper) || WALLPAPERS[0];

  if (wallpaper.type === 'color') {
    return (
      <div 
        className="wallpaper-background" 
        style={{ backgroundColor: wallpaper.value }}
      />
    );
  }

  return (
    <div 
      className="wallpaper-background"
      dangerouslySetInnerHTML={{ __html: wallpaper.value }}
    />
  );
};

export default WallpaperBackground;
