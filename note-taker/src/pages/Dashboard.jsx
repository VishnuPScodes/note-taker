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
import WallpaperPicker from '../components/Common/WallpaperPicker';
import { useDialog } from '../context/DialogContext';
import ContextMenu from '../components/Common/ContextMenu';
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
        display: 'inline-block',
        cursor: 'pointer'
      }}
    >
      {children}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    notes, 
    folders, 
    loading, 
    currentFolder, 
    setCurrentFolder, 
    updateNote, 
    updateFolder, 
    trashFolder, 
    fetchNotes, 
    fetchFolders 
  } = useNotes();
  const { showConfirm } = useDialog();
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    fetchNotes({ isTrashed: false });
    fetchFolders({ isTrashed: false });
  }, [fetchNotes, fetchFolders]);

  const handleDashboardContextMenu = (e) => {
    // Only show if we didn't click a folder or note (which might have their own menus/actions)
    if (!e.target.closest('.folder-icon-container') && !e.target.closest('.note-card')) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const dashboardMenuOptions = [
    { label: 'New Note', icon: '✏️', onClick: handleNewNote },
    { label: 'New Folder', icon: '📁', onClick: () => setShowFolderModal(true) },
    { separator: true },
    { label: 'Change Wallpaper', icon: '🖼️', onClick: () => setShowWallpaperPicker(true) },
    { label: 'Open Bin', icon: '🗑️', onClick: () => navigate('/bin') },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter folders based on current folder and trash status
  const displayedFolders = folders.filter(folder => 
    !folder.isTrashed && (currentFolder ? folder.parentId === currentFolder._id : !folder.parentId)
  );

  // Filter notes based on current folder and trash status
  const displayedNotes = currentFolder
    ? notes.filter(note => !note.isTrashed && note.folderId === currentFolder._id)
    : notes.filter(note => !note.isTrashed && !note.folderId);

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

  const handleLogout = async () => {
    const ok = await showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Logout',
      variant: 'danger'
    });
    
    if (ok) {
      logout();
      navigate('/login');
    }
  };

  const handleRenameFolder = (folder) => {
    setEditingFolder(folder);
    setShowRenameModal(true);
  };

  if (loading && notes.length === 0 && folders.length === 0) {
    return <LoadingSpinner text="Loading your workspace..." />;
  }

  return (
    <div className="dashboard" onContextMenu={handleDashboardContextMenu}>
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h2 className="app-title" onClick={handleBackToRoot} style={{ cursor: 'pointer' }}>📝 NoteTaker</h2>
        </div>
        <div className="nav-right">
          <span className="user-name">Hi, {user?.username}!</span>
          <Button variant="ghost" size="sm" onClick={() => setShowWallpaperPicker(true)}>
            🖼️ Wallpaper
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bin')}>
            🗑️ Bin
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="dashboard-content">
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

          <div className="action-bar">
            <Button variant="primary" onClick={handleNewNote}>
              ✏️ New Note
            </Button>
            <Button variant="secondary" onClick={() => setShowFolderModal(true)}>
              📁 New Folder
            </Button>
          </div>

          <div className="items-grid">
            {displayedFolders.map(folder => (
              <FolderIcon
                key={folder._id}
                folder={folder}
                onClick={() => handleFolderClick(folder)}
                onRename={() => handleRenameFolder(folder)}
                onDelete={async () => {
                  const ok = await showConfirm({
                    title: 'Move to Bin',
                    message: `Are you sure you want to move "${folder.name}" to the bin? All notes inside will also be hidden.`,
                    confirmText: 'Move to Bin',
                    variant: 'danger'
                  });
                  if (ok) {
                    trashFolder(folder._id);
                  }
                }}
              />
            ))}

            {displayedNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => handleEditNote(note)}
              />
            ))}

            {displayedFolders.length === 0 && displayedNotes.length === 0 && (
              <div className="empty-state">
                <h3>{currentFolder ? 'This folder is empty' : 'Welcome to NoteTaker! 🎉'}</h3>
                <p>{currentFolder ? 'Drag items here or create new ones' : 'Create your first note or folder to get started'}</p>
              </div>
            )}
          </div>
        </div>
      </DndContext>

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

      {showWallpaperPicker && (
        <WallpaperPicker 
          isOpen={showWallpaperPicker}
          onClose={() => setShowWallpaperPicker(false)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={dashboardMenuOptions}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
