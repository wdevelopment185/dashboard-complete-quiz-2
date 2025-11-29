const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Document = require('../models/Document');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Restrict to document types only (no images/audio/video/archives)
    const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.xls', '.xlsx', '.rtf']);
    const allowedMimePrefixes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/rtf'
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    const extAllowed = allowedExtensions.has(ext);
    const mimeAllowed = allowedMimePrefixes.some(prefix => mime === prefix);

    if (extAllowed && mimeAllowed) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX'));
  }
});

// CREATE - Upload document(s)
router.post('/documents/upload', authenticateToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const documents = [];
    const { title, description, category, tags, isPublic } = req.body;

    for (const file of req.files) {
      const document = new Document({
        title: title || file.originalname,
        description: description || '',
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedBy: req.user.id,
        category: category || 'document',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isPublic: isPublic === 'true' || false
      });

      await document.save();
      documents.push(document);
    }

    res.status(201).json({
      success: true,
      message: `${documents.length} file(s) uploaded successfully`,
      documents
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// READ - Get all documents with pagination and filtering
router.get('/documents', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId
    } = req.query;

    const filter = { status };

    // Add category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Add user filter
    if (userId) {
      filter.uploadedBy = userId;
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Document.countDocuments(filter);

    res.json({
      success: true,
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDocuments: total,
        hasNext: skip + documents.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// READ - Get single document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await Document.findById(id)
      .populate('uploadedBy', 'firstName lastName email')
      .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Fetch document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
});

// UPDATE - Update document metadata
router.put('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const { title, description, category, tags, isPublic } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const document = await Document.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
});

// UPDATE - Archive/Restore document
router.patch('/documents/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    if (!['active', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "archived"'
      });
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('uploadedBy', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: `Document ${status} successfully`,
      document
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document status',
      error: error.message
    });
  }
});

// DELETE - Delete document (soft delete)
router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await Document.findByIdAndUpdate(
      id,
      { status: 'deleted' },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// DELETE - Permanently delete document and file
router.delete('/documents/:id/permanent', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(document.path);
    } catch (fileError) {
      console.warn('File deletion warning:', fileError.message);
    }

    // Delete from database
    await Document.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Document permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete document',
      error: error.message
    });
  }
});

// BULK DELETE - Delete multiple documents
router.delete('/documents/bulk/:criteria', authenticateToken, async (req, res) => {
  try {
    const { criteria } = req.params;
    const { ids, category, status, userId } = req.body;

    let filter = {};

    if (criteria === 'ids' && ids && ids.length > 0) {
      filter._id = { $in: ids };
    } else if (criteria === 'category' && category) {
      filter.category = category;
    } else if (criteria === 'user' && userId) {
      filter.uploadedBy = userId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bulk delete criteria'
      });
    }

    // Only delete active/archived documents (not already deleted)
    filter.status = { $ne: 'deleted' };

    const result = await Document.updateMany(filter, { status: 'deleted' });

    res.json({
      success: true,
      message: `${result.modifiedCount} documents deleted successfully`,
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete documents',
      error: error.message
    });
  }
});

// DOWNLOAD - Download document file
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }

    const document = await Document.findById(id);

    if (!document || document.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Increment download count
    await Document.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Stream the file
    res.download(document.path, document.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
});

// ANALYTICS - Get document statistics
router.get('/documents/analytics/stats', authenticateToken, async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments({ status: { $ne: 'deleted' } });
    const activeDocuments = await Document.countDocuments({ status: 'active' });
    const archivedDocuments = await Document.countDocuments({ status: 'archived' });
    
    const categoryStats = await Document.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentUploads = await Document.find({ status: { $ne: 'deleted' } })
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalSize = await Document.aggregate([
      { $match: { status: { $ne: 'deleted' } } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDocuments,
        activeDocuments,
        archivedDocuments,
        categoryStats,
        recentUploads,
        totalSize: totalSize[0]?.totalSize || 0
      }
    });
  } catch (error) {
    console.error('Document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document statistics',
      error: error.message
    });
  }
});

// ANALYTICS - Monthly upload trends and storage per month
router.get('/documents/analytics/trends', authenticateToken, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsInt = Math.min(Math.max(parseInt(months) || 6, 1), 24);

    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - (monthsInt - 1), 1);

    // Aggregate by year-month
    const pipeline = [
      { $match: { status: { $ne: 'deleted' }, createdAt: { $gte: start, $lte: end } } },
      { $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          size: '$size'
        }
      },
      { $group: {
          _id: { year: '$year', month: '$month' },
          uploads: { $sum: 1 },
          totalSize: { $sum: { $ifNull: ['$size', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    const agg = await Document.aggregate(pipeline);

    // Build a complete series ensuring months with zero data are present
    const series = [];
    for (let i = monthsInt - 1; i >= 0; i--) {
      const dt = new Date(end.getFullYear(), end.getMonth() - i, 1);
      const found = agg.find(a => a._id.year === dt.getFullYear() && a._id.month === dt.getMonth() + 1);
      const uploads = found ? found.uploads : 0;
      const storageGb = found ? (found.totalSize / (1024 * 1024 * 1024)) : 0;
      series.push({
        year: dt.getFullYear(),
        monthIndex: dt.getMonth(),
        month: dt.toLocaleString(undefined, { month: 'short' }),
        uploads,
        storage: Number(storageGb.toFixed(2))
      });
    }

    res.json({
      success: true,
      months: monthsInt,
      series
    });
  } catch (error) {
    console.error('Document trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document trends',
      error: error.message
    });
  }
});

module.exports = router;