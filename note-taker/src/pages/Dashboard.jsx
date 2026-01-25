import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import NoteCard from '../components/Notes/NoteCard';
import FolderIcon from '../components/Folders/FolderIcon';
import NoteModal from '../components/Notes/NoteModal';
import FolderModal from '../components/Folders/FolderModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notes, folders, loading, currentFolder, setCurrentFolder, fetchNotes } = useNotes();
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Filter notes based on current folder
  const displayedNotes = currentFolder
    ? notes.filter(note => note.folderId === currentFolder._id)
    : notes.filter(note => !note.folderId);

  const handleNewNote = () => {
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
  };

  const handleBackToRoot = () => {
    setCurrentFolder(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && notes.length === 0) {
    return <LoadingSpinner text="Loading your notes..." />;
  }

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h2 className="app-title">📝 NoteTaker</h2>
        </div>
        <div className="nav-right">
          <span className="user-name">Hi, {user?.username}!</span>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bin')}>
            🗑️ Bin
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button 
            className="breadcrumb-item" 
            onClick={handleBackToRoot}
          >
            🏠 All Notes
          </button>
          {currentFolder && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">
                📁 {currentFolder.name}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-bar">
          <Button variant="primary" onClick={handleNewNote}>
            ✏️ New Note
          </Button>
          {!currentFolder && (
            <Button variant="secondary" onClick={() => setShowFolderModal(true)}>
              📁 New Folder
            </Button>
          )}
        </div>

        {/* Grid Display */}
        <div className="items-grid">
          {/* Show folders only in root view */}
          {!currentFolder && folders.map(folder => (
            <FolderIcon
              key={folder._id}
              folder={folder}
              onClick={() => handleFolderClick(folder)}
            />
          ))}

          {/* Show notes */}
          {displayedNotes.map(note => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => handleEditNote(note)}
            />
          ))}

          {/* Empty State */}
          {!currentFolder && folders.length === 0 && notes.length === 0 && (
            <div className="empty-state">
              <h3>Welcome to NoteTaker! 🎉</h3>
              <p>Create your first note or folder to get started</p>
            </div>
          )}

          {currentFolder && displayedNotes.length === 0 && (
            <div className="empty-state">
              <h3>This folder is empty</h3>
              <p>Create a new note to add it to this folder</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNoteModal && (
        <NoteModal
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setEditingNote(null);
          }}
          note={editingNote}
          folderId={currentFolder?._id}
        />
      )}

      {showFolderModal && (
        <FolderModal
          isOpen={showFolderModal}
          onClose={() => setShowFolderModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
