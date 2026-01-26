import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import NoteCard from '../components/Notes/NoteCard';
import { useDialog } from '../context/DialogContext';
import './Bin.css';

const Bin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    notes, 
    folders, 
    loading, 
    fetchNotes, 
    fetchFolders, 
    restoreNote, 
    deleteNote, 
    restoreFolder, 
    deleteFolder, 
    emptyTrash 
  } = useNotes();
  const { showConfirm } = useDialog();

  useEffect(() => {
    fetchNotes({ isTrashed: true });
    fetchFolders({ isTrashed: true });
  }, [fetchNotes, fetchFolders]);

  const handleRestoreNote = async (id) => {
    await restoreNote(id);
  };

  const handleRestoreFolder = async (id) => {
    await restoreFolder(id);
  };

  const handleDeleteNotePermanently = async (id) => {
    const ok = await showConfirm({
      title: 'Delete Permanently',
      message: 'Are you sure you want to delete this note forever? This action cannot be undone.',
      confirmText: 'Delete Forever',
      variant: 'danger'
    });
    
    if (ok) {
      await deleteNote(id);
    }
  };

  const handleDeleteFolderPermanently = async (id, name) => {
    const ok = await showConfirm({
      title: 'Delete Folder Permanently',
      message: `Are you sure you want to delete "${name}" forever? Everything inside will also be lost forever.`,
      confirmText: 'Delete Forever',
      variant: 'danger'
    });
    
    if (ok) {
      await deleteFolder(id);
    }
  };

  const handleEmptyBin = async () => {
    const ok = await showConfirm({
      title: 'Empty Bin',
      message: 'Are you sure you want to delete all items in the bin permanently? This cannot be undone.',
      confirmText: 'Empty Bin',
      variant: 'danger'
    });
    
    if (ok) {
      await emptyTrash();
    }
  };

  const totalItems = notes.length + folders.length;

  if (loading && totalItems === 0) {
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
            <p className="items-count">{totalItems} item(s) in bin</p>
          </div>
          {totalItems > 0 && (
            <Button variant="danger" size="sm" onClick={handleEmptyBin}>
              Empty Bin
            </Button>
          )}
        </div>

        {totalItems === 0 ? (
          <div className="empty-bin-state fade-in">
            <div className="empty-bin-icon">🗑️</div>
            <h3>Your bin is empty</h3>
            <p>Notes and folders you delete will appear here until they are permanently removed.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Go back home
            </Button>
          </div>
        ) : (
          <div className="bin-grid fade-in">
            {/* Display Folders first */}
            {folders.map(folder => (
              <div key={folder._id} className="bin-item-wrapper">
                <div className="bin-folder-preview card glass">
                  <div className="folder-visual" style={{ width: '40px', height: '40px', color: '#00a2ff' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                    </svg>
                  </div>
                  <span className="folder-name" style={{ marginTop: '8px', fontSize: '0.8rem' }}>{folder.name}</span>
                </div>
                <div className="bin-item-actions">
                  <button 
                    className="bin-action-btn restore" 
                    onClick={() => handleRestoreFolder(folder._id)}
                    title="Restore folder"
                  >
                    🔄 Restore
                  </button>
                  <button 
                    className="bin-action-btn delete" 
                    onClick={() => handleDeleteFolderPermanently(folder._id, folder.name)}
                    title="Delete permanently"
                  >
                    ✖ Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Display Notes */}
            {notes.map(note => (
              <div key={note._id} className="bin-item-wrapper">
                <NoteCard 
                  note={note} 
                  onEdit={() => {}} // Non-editable in bin
                />
                <div className="bin-item-actions">
                  <button 
                    className="bin-action-btn restore" 
                    onClick={() => handleRestoreNote(note._id)}
                    title="Restore note"
                  >
                    🔄 Restore
                  </button>
                  <button 
                    className="bin-action-btn delete" 
                    onClick={() => handleDeleteNotePermanently(note._id)}
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
