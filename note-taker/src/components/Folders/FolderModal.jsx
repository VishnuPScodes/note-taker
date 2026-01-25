import React, { useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';

const FolderModal = ({ isOpen, onClose, parentId = null, folder = null }) => {
  const { createFolder, updateFolder } = useNotes();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName('');
    }
  }, [folder, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    setLoading(true);

    let result;
    if (folder) {
      result = await updateFolder(folder._id, { name: name.trim() });
    } else {
      result = await createFolder({ 
        name: name.trim(),
        parentId 
      });
    }

    setLoading(false);

    if (result.success) {
      setName('');
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={folder ? 'Rename Folder' : 'Create New Folder'}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        
        <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label htmlFor="folderName">Folder Name</label>
          <input
            type="text"
            id="folderName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New Folder"
            autoFocus
            required
          />
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>
            {folder ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FolderModal;
