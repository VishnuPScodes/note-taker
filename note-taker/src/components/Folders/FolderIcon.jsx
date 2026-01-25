import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useNotes } from '../../context/NotesContext';
import ContextMenu from '../Common/ContextMenu';
import './FolderIcon.css';

const FolderIcon = ({ folder, onClick, onRename, onDelete }) => {
  const { deleteFolder } = useNotes();
  const [contextMenu, setContextMenu] = useState(null);

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging
  } = useDraggable({
    id: folder._id,
    data: { type: 'folder', folder }
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: folder._id,
    data: { type: 'folder', folder }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    backgroundColor: isOver ? 'rgba(99, 102, 241, 0.1)' : undefined,
    borderRadius: 'var(--radius-lg)'
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Combine refs
  const setRefs = (node) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const menuOptions = [
    { label: 'Open', icon: '📂', onClick: onClick },
    { label: 'Rename', icon: '✏️', onClick: onRename },
    { separator: true },
    { label: 'Delete', icon: '🗑️', onClick: onDelete, danger: true },
  ];

  return (
    <>
      <div 
        ref={setRefs}
        style={style}
        className={`folder-icon-container fade-in ${isOver ? 'drop-target' : ''}`}
        onClick={onClick}
        onContextMenu={handleContextMenu}
        title="Drag to move, right-click for options"
        {...attributes}
        {...listeners}
      >
        <div className="folder-visual">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </div>
        <span className="folder-name">{folder.name}</span>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={menuOptions}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default FolderIcon;
