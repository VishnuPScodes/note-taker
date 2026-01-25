import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import NoteCard from '../components/Notes/NoteCard';
import './Bin.css';

const Bin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notes, loading, fetchNotes, restoreNote, deleteNote, emptyTrash } = useNotes();

  useEffect(() => {
    fetchNotes({ isTrashed: true });
  }, [fetchNotes]);

  const handleRestore = async (id) => {
    await restoreNote(id);
  };

  const handleDeletePermanently = async (id) => {
    if (window.confirm('Delete this note forever? This action cannot be undone.')) {
      await deleteNote(id);
    }
  };

  const handleEmptyBin = async () => {
    if (window.confirm('Are you sure you want to delete all items in the bin permanently?')) {
      await emptyTrash();
    }
  };

  if (loading && notes.length === 0) {
    return <LoadingSpinner text="Searching for deleted items..." />;
  }

  return (
    <div className="bin-page">
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h2 className="app-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            📝 NoteTaker
          </h2>
        </div>
        <div className="nav-right">
          <span className="user-name">Hi, {user?.username}!</span>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            🏠 Home
          </Button>
        </div>
      </nav>

      <div className="bin-content">
        <div className="bin-header">
          <div className="bin-title-group">
            <h1>🗑️ Bin</h1>
            <p className="items-count">{notes.length} note(s) in bin</p>
          </div>
          {notes.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleEmptyBin}>
              Empty Bin
            </Button>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="empty-bin-state fade-in">
            <div className="empty-bin-icon">🗑️</div>
            <h3>Your bin is empty</h3>
            <p>Notes you delete will appear here for 30 days before permanent deletion.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go back home
            </Button>
          </div>
        ) : (
          <div className="bin-grid fade-in">
            {notes.map(note => (
              <div key={note._id} className="bin-item-wrapper">
                <NoteCard 
                  note={note} 
                  onEdit={() => {}} // Non-editable in bin
                />
                <div className="bin-item-actions">
                  <button 
                    className="bin-action-btn restore" 
                    onClick={() => handleRestore(note._id)}
                    title="Restore to original folder"
                  >
                    🔄 Restore
                  </button>
                  <button 
                    className="bin-action-btn delete" 
                    onClick={() => handleDeletePermanently(note._id)}
                    title="Delete permanently"
                  >
                    ✖ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bin;
