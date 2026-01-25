import express from 'express';
import { body, validationResult } from 'express-validator';
import Folder from '../models/Folder.js';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateFolder = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ max: 50 })
    .withMessage('Folder name cannot exceed 50 characters')
];

// @route   GET /api/folders
// @desc    Get all user's folders
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const { isTrashed } = req.query;
    const query = { userId: req.userId };

    if (isTrashed !== undefined) {
      query.isTrashed = isTrashed === 'true';
    } else {
      query.isTrashed = false; // Default to non-trashed
    }

    const folders = await Folder.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      folders
    });

  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching folders' 
    });
  }
});

// @route   POST /api/folders
// @desc    Create new folder
// @access  Protected
router.post('/', auth, validateFolder, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { name, position, parentId } = req.body;

    // Check if folder with same name already exists for this user in the same parent folder
    const existingFolder = await Folder.findOne({ 
      userId: req.userId, 
      name,
      parentId: parentId || null
    });

    if (existingFolder) {
      return res.status(400).json({ 
        success: false,
        message: 'A folder with this name already exists in this location' 
      });
    }

    // Create new folder
    const folder = new Folder({
      userId: req.userId,
      name,
      parentId: parentId || null,
      position: position || { x: 0, y: 0 }
    });

    await folder.save();

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating folder' 
    });
  }
});

// @route   PUT /api/folders/:id
// @desc    Update folder
// @access  Protected
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, position, parentId } = req.body;

    // Find folder and verify ownership
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        message: 'Folder not found' 
      });
    }

    // If name is being updated, check for duplicates
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({ 
        userId: req.userId, 
        name,
        parentId: folder.parentId,
        _id: { $ne: req.params.id }
      });

      if (existingFolder) {
        return res.status(400).json({ 
          success: false,
          message: 'A folder with this name already exists in this location' 
        });
      }

      folder.name = name.trim();
    }

    // Update position if provided
    if (position) {
      folder.position = position;
    }

    // Update parentId if provided
    if (parentId !== undefined) {
      // Prevent circular reference
      if (parentId === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'A folder cannot be its own parent'
        });
      }
      folder.parentId = parentId === 'null' ? null : parentId;
    }

    await folder.save();

    res.json({
      success: true,
      message: 'Folder updated successfully',
      folder
    });

  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating folder' 
    });
  }
});

// @route   PUT /api/folders/:id/trash
// @desc    Move folder to trash
// @access  Protected
router.put('/:id/trash', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        message: 'Folder not found' 
      });
    }

    folder.isTrashed = true;
    await folder.save();

    // Also trash all notes inside this folder
    await Note.updateMany(
      { folderId: req.params.id, userId: req.userId },
      { $set: { isTrashed: true } }
    );

    res.json({
      success: true,
      message: 'Folder moved to trash',
      folder
    });

  } catch (error) {
    console.error('Trash folder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while moving folder to trash' 
    });
  }
});

// @route   PUT /api/folders/:id/restore
// @desc    Restore folder from trash
// @access  Protected
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        message: 'Folder not found' 
      });
    }

    folder.isTrashed = false;
    await folder.save();

    // Also restore all notes inside this folder
    await Note.updateMany(
      { folderId: req.params.id, userId: req.userId },
      { $set: { isTrashed: false } }
    );

    res.json({
      success: true,
      message: 'Folder restored successfully',
      folder
    });

  } catch (error) {
    console.error('Restore folder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while restoring folder' 
    });
  }
});

// @route   DELETE /api/folders/:id
// @desc    Permanently delete folder
// @access  Protected
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find folder and verify ownership
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        message: 'Folder not found' 
      });
    }

    // Delete all notes in the folder permanently
    await Note.deleteMany({ folderId: req.params.id, userId: req.userId });

    // Delete any subfolders permanently (simple level for now)
    await Folder.deleteMany({ parentId: req.params.id, userId: req.userId });

    // Delete the folder itself
    await Folder.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Folder and its contents permanently deleted'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting folder' 
    });
  }
});

export default router;
