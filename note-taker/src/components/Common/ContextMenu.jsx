import React, { useEffect, useRef } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, options, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = () => onClose();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position if menu goes off screen
  const adjustPosition = () => {
    if (!menuRef.current) return { top: y, left: x };

    const menuRect = menuRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > screenWidth) {
      adjustedX = screenWidth - menuRect.width - 10;
    }
    if (y + menuRect.height > screenHeight) {
      adjustedY = screenHeight - menuRect.height - 10;
    }

    return { top: adjustedY, left: adjustedX };
  };

  const position = adjustPosition();

  return (
    <div 
      ref={menuRef}
      className="context-menu glass"
      style={{ top: position.top, left: position.left }}
    >
      {options.map((option, index) => (
        <React.Fragment key={index}>
          {option.separator ? (
            <div className="context-menu-separator" />
          ) : (
            <button
              className={`context-menu-item ${option.danger ? 'danger' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                option.onClick();
                onClose();
              }}
            >
              {option.icon && <span className="context-menu-icon">{option.icon}</span>}
              <span className="context-menu-label">{option.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
