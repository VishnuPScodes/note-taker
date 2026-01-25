import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';

const FolderModal = ({ isOpen, onClose, parentId = null }) => {
  const { createFolder } = useNotes();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    setLoading(true);

    const result = await createFolder({ 
      name: name.trim(),
      parentId 
    });

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
      title="Create New Folder"
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
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FolderModal;
