import React from 'react';
import { useNotes } from '../../context/NotesContext';
import './FolderIcon.css';

const FolderIcon = ({ folder, onClick }) => {
  const { deleteFolder } = useNotes();

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (window.confirm(`Delete folder "${folder.name}"? Notes inside will be moved to root.`)) {
      deleteFolder(folder._id, false);
    }
  };

  return (
    <div 
      className="folder-icon-container fade-in" 
      onClick={onClick}
      onContextMenu={handleContextMenu}
      title="Right-click to delete"
    >
      <div className="folder-visual">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <span className="folder-name">{folder.name}</span>
    </div>
  );
};

export default FolderIcon;
