import React from 'react';
import { format } from 'date-fns';
import { useNotes } from '../../context/NotesContext';
import './NoteCard.css';

const NoteCard = ({ note, onEdit }) => {
  const { trashNote } = useNotes();

  const handleTrash = (e) => {
    e.stopPropagation();
    if (window.confirm('Move this note to bin?')) {
      trashNote(note._id);
    }
  };

  const formattedDate = format(new Date(note.createdAt), 'MMM d, p');

  return (
    <div 
      className="note-card card fade-in" 
      style={{ backgroundColor: note.color || '#ffffff' }}
      onClick={onEdit}
    >
      <div className="note-card-content">
        <h3 className="note-title">{note.title}</h3>
        <p className="note-preview">
          {note.content.length > 100 
            ? `${note.content.substring(0, 100)}...` 
            : note.content}
        </p>
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
