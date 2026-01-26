import React, { useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';
import './NoteModal.css';

const PRESET_COLORS = [
  '#ffffff', '#fecaca', '#fde68a', '#d1fae5', 
  '#bfdbfe', '#ddd6fe', '#fae8ff', '#f3f4f6'
];

const NoteModal = ({ isOpen, onClose, note = null, folderId = null }) => {
  const { createNote, updateNote } = useNotes();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: '#ffffff',
    reminder: { dateTime: '', notified: false }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        color: note.color || '#ffffff',
        reminder: {
          dateTime: note.reminder?.dateTime ? new Date(note.reminder.dateTime).toISOString().slice(0, 16) : '',
          notified: note.reminder?.notified || false
        }
      });
    } else {
      setFormData({
        title: '',
        content: '',
        color: '#ffffff',
        reminder: { dateTime: '', notified: false }
      });
    }
  }, [note, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'reminder') {
      setFormData(prev => ({
        ...prev,
        reminder: { ...prev.reminder, dateTime: value, notified: false }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      folderId: note ? note.folderId : folderId,
      reminder: formData.reminder.dateTime ? formData.reminder : null
    };

    let result;
    if (note) {
      result = await updateNote(note._id, payload);
    } else {
      result = await createNote(payload);
    }

    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={note ? 'Edit Note' : 'Create New Note'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="note-form" style={{ '--selected-note-color': formData.color }}>
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Note title..."
            required
            style={{ background: 'rgba(255,255,255,0.7)' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your note here..."
            rows="10"
            required
            style={{ background: 'rgba(255,255,255,0.7)' }}
          ></textarea>
        </div>

        <div className="note-options">
          <div className="color-selector">
            <label>Card Color</label>
            <div className="color-presets">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-preset ${formData.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div className="reminder-selector">
            <label htmlFor="reminder">Set Reminder</label>
            <input
              type="datetime-local"
              id="reminder"
              name="reminder"
              value={formData.reminder.dateTime}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {note ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;
