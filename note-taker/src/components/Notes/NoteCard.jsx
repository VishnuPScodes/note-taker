import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useNotes } from '../../context/NotesContext';
import { useDialog } from '../../context/DialogContext';
import './NoteCard.css';

const NoteCard = ({ note, onEdit }) => {
  const { trashNote } = useNotes();
  const { showConfirm } = useDialog();
  const [isTrashing, setIsTrashing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: note._id,
    data: { type: 'note', note }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: (isDragging || isTrashing) ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
    backgroundColor: note.color || '#ffffff'
  };

  const handleTrash = async (e) => {
    e.stopPropagation();
    const ok = await showConfirm({
      title: 'Move to Bin',
      message: 'Are you sure you want to move this note to the bin?',
      confirmText: 'Move to Bin',
      variant: 'danger'
    });
    
    if (ok) {
      setIsTrashing(true);
      // Wait for the CSS animation to complete
      setTimeout(() => {
        trashNote(note._id);
      }, 400); 
    }
  };

  const formattedDate = format(new Date(note.createdAt), 'MMM d, p');

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const plainText = stripHtml(note.content);
  const previewText = plainText.length > 100 
    ? `${plainText.substring(0, 100)}...` 
    : plainText;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`note-card card fade-in ${isDragging ? 'dragging' : ''} ${isTrashing ? 'trashing' : ''}`}
      onClick={(e) => {
        if (!isDragging && !isTrashing) onEdit(e);
      }}
      {...attributes}
      {...listeners}
    >
      <div className="note-card-content">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-preview">{previewText}</p>
      </div>
      
      <div className="note-card-footer">
        <span className="note-date">{formattedDate}</span>
        <button 
          className="note-trash-btn" 
          onClick={handleTrash}
          title="Move to Bin"
        >
          🗑️
        </button>
      </div>

      {note.reminder?.dateTime && (
        <div className="note-reminder-badge" title={`Reminder: ${format(new Date(note.reminder.dateTime), 'PPp')}`}>
          🔔
        </div>
      )}
    </div>
  );
};

export default NoteCard;
