import express from 'express';
import { body, validationResult } from 'express-validator';
import Note from '../models/Note.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateNote = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Note title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Note content is required')
];

// @route   GET /api/notes
// @desc    Get all user's notes (with optional filters)
// @access  Protected
router.get('/', auth, async (req, res) => {
  try {
    const { folderId, isTrashed } = req.query;

    // Build query
    const query = { userId: req.userId };

    if (folderId !== undefined) {
      query.folderId = folderId === 'null' ? null : folderId;
    }

    if (isTrashed !== undefined) {
      query.isTrashed = isTrashed === 'true';
    }

    const notes = await Note.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching notes' 
    });
  }
});

// @route   GET /api/notes/:id
// @desc    Get specific note
// @access  Protected
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    res.json({
      success: true,
      note
    });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching note' 
    });
  }
});

// @route   POST /api/notes
// @desc    Create new note
// @access  Protected
router.post('/', auth, validateNote, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { title, content, color, folderId, position } = req.body;

    // Create new note
    const note = new Note({
      userId: req.userId,
      title,
      content,
      color: color || '#ffffff',
      folderId: folderId || null,
      position: position || { x: 0, y: 0 }
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating note' 
    });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Protected
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, color, folderId, position, reminder } = req.body;

    // Find note and verify ownership
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    // Update fields if provided
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (folderId !== undefined) note.folderId = folderId;
    if (position !== undefined) note.position = position;
    if (reminder !== undefined) note.reminder = reminder;

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating note' 
    });
  }
});

// @route   PUT /api/notes/:id/trash
// @desc    Move note to trash
// @access  Protected
router.put('/:id/trash', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    note.isTrashed = true;
    await note.save();

    res.json({
      success: true,
      message: 'Note moved to trash',
      note
    });

  } catch (error) {
    console.error('Trash note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while moving note to trash' 
    });
  }
});

// @route   PUT /api/notes/:id/restore
// @desc    Restore note from trash
// @access  Protected
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    note.isTrashed = false;
    await note.save();

    res.json({
      success: true,
      message: 'Note restored successfully',
      note
    });

  } catch (error) {
    console.error('Restore note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while restoring note' 
    });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Permanently delete note
// @access  Protected
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }

    await Note.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Note deleted permanently'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting note' 
    });
  }
});

// @route   DELETE /api/notes/trash/empty
// @desc    Empty trash (delete all trashed notes)
// @access  Protected
router.delete('/trash/empty', auth, async (req, res) => {
  try {
    const result = await Note.deleteMany({ 
      userId: req.userId, 
      isTrashed: true 
    });

    res.json({
      success: true,
      message: `${result.deletedCount} note(s) deleted permanently`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Empty trash error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while emptying trash' 
    });
  }
});

export default router;
