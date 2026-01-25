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

import { DndContext, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core';

const RootDropTarget = ({ onClick, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-level',
    data: { type: 'root' }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`breadcrumb-item ${isOver ? 'root-drop-active' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: isOver ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
        display: 'inline-block'
      }}
    >
      {children}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notes, folders, loading, currentFolder, setCurrentFolder, updateNote, updateFolder, deleteFolder } = useNotes();
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);

  const handleRenameFolder = (folder) => {
    setEditingFolder(folder);
    setShowRenameModal(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter folders based on current folder
  const displayedFolders = folders.filter(folder => 
    currentFolder ? folder.parentId === currentFolder._id : !folder.parentId
  );

  // Filter notes based on current folder
  const displayedNotes = currentFolder
    ? notes.filter(note => note.folderId === currentFolder._id)
    : notes.filter(note => !note.folderId);

  // Calculate breadcrumb path
  const getBreadcrumbPath = () => {
    if (!currentFolder) return [];
    
    const path = [];
    let tempFolder = currentFolder;
    
    while (tempFolder) {
      path.unshift(tempFolder);
      if (!tempFolder.parentId) break;
      tempFolder = folders.find(f => f._id === tempFolder.parentId);
    }
    
    return path;
  };

  const breadcrumbPath = getBreadcrumbPath();

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      if (overData.type === 'folder') {
        const targetFolderId = over.id;

        if (activeData.type === 'note') {
          await updateNote(active.id, { folderId: targetFolderId });
        } else if (activeData.type === 'folder') {
          // Prevent dragging a folder into its own children or itself is already handled by dnd-kit basic logic
          await updateFolder(active.id, { parentId: targetFolderId });
        }
      } else if (overData.type === 'root') {
        if (activeData.type === 'note') {
          await updateNote(active.id, { folderId: null });
        } else if (activeData.type === 'folder') {
          await updateFolder(active.id, { parentId: null });
        }
      }
    }
  };

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
          <h2 className="app-title" onClick={handleBackToRoot} style={{ cursor: 'pointer' }}>📝 NoteTaker</h2>
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
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="dashboard-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <RootDropTarget onClick={handleBackToRoot}>
              🏠 All Notes
            </RootDropTarget>
            
            {breadcrumbPath.map((folder, index) => (
              <React.Fragment key={folder._id}>
                <span className="breadcrumb-separator">/</span>
                <button 
                  className={`breadcrumb-item ${index === breadcrumbPath.length - 1 ? 'active' : ''}`}
                  onClick={() => handleFolderClick(folder)}
                  disabled={index === breadcrumbPath.length - 1}
                >
                  📁 {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-bar">
            <Button variant="primary" onClick={handleNewNote}>
              ✏️ New Note
            </Button>
            <Button variant="secondary" onClick={() => setShowFolderModal(true)}>
              📁 New Folder
            </Button>
          </div>

          {/* Grid Display */}
          <div className="items-grid">
            {/* Show current level folders */}
            {displayedFolders.map(folder => (
              <FolderIcon
                key={folder._id}
                folder={folder}
                onClick={() => handleFolderClick(folder)}
                onRename={() => handleRenameFolder(folder)}
                onDelete={() => {
                  if (window.confirm(`Delete folder "${folder.name}"? Notes inside will be moved up one level.`)) {
                    deleteFolder(folder._id, false);
                  }
                }}
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
            {displayedFolders.length === 0 && displayedNotes.length === 0 && (
              <div className="empty-state">
                <h3>{currentFolder ? 'This folder is empty' : 'Welcome to NoteTaker! 🎉'}</h3>
                <p>{currentFolder ? 'Drag items here or create new ones' : 'Create your first note or folder to get started'}</p>
              </div>
            )}
          </div>
        </div>
      </DndContext>

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
          parentId={currentFolder?._id}
        />
      )}

      {showRenameModal && (
        <FolderModal
          isOpen={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setEditingFolder(null);
          }}
          folder={editingFolder}
        />
      )}
    </div>
  );
};

export default Dashboard;
