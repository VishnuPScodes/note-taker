import React, { useState } from 'react';
import { useWallpaper } from '../../context/WallpaperContext';
import { WALLPAPERS, WALLPAPER_CATEGORIES } from '../../data/wallpapers';
import Modal from './Modal';
import Button from './Button';
import './WallpaperPicker.css';

const WallpaperPicker = ({ isOpen, onClose }) => {
  const { currentWallpaper, setCurrentWallpaper } = useWallpaper();
  const [activeCategory, setActiveCategory] = useState(WALLPAPER_CATEGORIES[0]);

  const filteredWallpapers = WALLPAPERS.filter(w => w.category === activeCategory);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Choose Wallpaper"
      size="lg"
    >
      <div className="wallpaper-picker">
        <div className="category-tabs">
          {WALLPAPER_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="wallpaper-grid">
          {filteredWallpapers.map(wp => (
            <div 
              key={wp.id}
              className={`wallpaper-item ${currentWallpaper === wp.id ? 'selected' : ''}`}
              onClick={() => setCurrentWallpaper(wp.id)}
            >
              <div className="wallpaper-preview-container">
                {wp.type === 'color' ? (
                  <div className="wallpaper-preview-fill" style={{ backgroundColor: wp.value }} />
                ) : (
                  <div 
                    className="wallpaper-preview-svg" 
                    dangerouslySetInnerHTML={{ __html: wp.value }} 
                  />
                )}
                {currentWallpaper === wp.id && (
                  <div className="selected-badge">✓</div>
                )}
              </div>
              <span className="wallpaper-name">{wp.name}</span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <Button variant="primary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
};

export default WallpaperPicker;
