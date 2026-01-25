import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { notesAPI, foldersAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotesContext = createContext(null);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all folders
  const fetchFolders = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;

    try {
      const response = await foldersAPI.getAll(params);
      setFolders(response.data.folders);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to fetch folders');
    }
  }, [isAuthenticated]);

  // Fetch all notes
  const fetchNotes = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await notesAPI.getAll(filters);
      setNotes(response.data.notes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolders({ isTrashed: false });
      fetchNotes({ isTrashed: false });
    }
  }, [isAuthenticated, fetchFolders, fetchNotes]);

  // Folder operations
  const createFolder = async (folderData) => {
    try {
      const response = await foldersAPI.create(folderData);
      setFolders(prev => [response.data.folder, ...prev]);
      return { success: true, folder: response.data.folder };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create folder';
      return { success: false, error: message };
    }
  };

  const updateFolder = async (id, folderData) => {
    try {
      const response = await foldersAPI.update(id, folderData);
      setFolders(prev => prev.map(f => f._id === id ? response.data.folder : f));
      return { success: true, folder: response.data.folder };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update folder';
      return { success: false, error: message };
    }
  };

  const trashFolder = async (id) => {
    try {
      await foldersAPI.trash(id);
      setFolders(prev => prev.filter(f => f._id !== id));
      // Trashing a folder also trash its notes on the backend, 
      // so we should refresh notes list
      fetchNotes({ isTrashed: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to move folder to trash';
      return { success: false, error: message };
    }
  };

  const restoreFolder = async (id) => {
    try {
      await foldersAPI.restore(id);
      setFolders(prev => prev.filter(f => f._id !== id));
      // Refresh to get restored notes back
      fetchNotes({ isTrashed: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restore folder';
      return { success: false, error: message };
    }
  };

  const deleteFolder = async (id) => {
    try {
      await foldersAPI.delete(id);
      setFolders(prev => prev.filter(f => f._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete folder';
      return { success: false, error: message };
    }
  };

  // Note operations
  const createNote = async (noteData) => {
    try {
      const response = await notesAPI.create(noteData);
      setNotes(prev => [response.data.note, ...prev]);
      return { success: true, note: response.data.note };
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.errors?.[0]?.msg ||
                     'Failed to create note';
      return { success: false, error: message };
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const response = await notesAPI.update(id, noteData);
      setNotes(prev => prev.map(n => n._id === id ? response.data.note : n));
      return { success: true, note: response.data.note };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update note';
      return { success: false, error: message };
    }
  };

  const trashNote = async (id) => {
    try {
      await notesAPI.trash(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to move note to trash';
      return { success: false, error: message };
    }
  };

  const restoreNote = async (id) => {
    try {
      const response = await notesAPI.restore(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      return { success: true, note: response.data.note };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restore note';
      return { success: false, error: message };
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete note';
      return { success: false, error: message };
    }
  };

  const emptyTrash = async () => {
    try {
      const response = await notesAPI.emptyTrash();
      setNotes([]);
      return { success: true, deletedCount: response.data.deletedCount };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to empty trash';
      return { success: false, error: message };
    }
  };

  const value = {
    notes,
    folders,
    currentFolder,
    loading,
    error,
    setCurrentFolder,
    fetchNotes,
    fetchFolders,
    createFolder,
    updateFolder,
    trashFolder,
    restoreFolder,
    deleteFolder,
    createNote,
    updateNote,
    trashNote,
    restoreNote,
    deleteNote,
    emptyTrash
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export default NotesContext;
