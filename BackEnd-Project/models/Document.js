const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimeType: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader ID is required']
  },
  category: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'other'],
    default: 'document'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file type based on mime type
documentSchema.virtual('fileType').get(function() {
  if (this.mimeType.startsWith('image/')) return 'Image';
  if (this.mimeType.startsWith('video/')) return 'Video';
  if (this.mimeType.startsWith('audio/')) return 'Audio';
  if (this.mimeType.includes('pdf')) return 'PDF';
  if (this.mimeType.includes('word') || this.mimeType.includes('document')) return 'Document';
  if (this.mimeType.includes('sheet') || this.mimeType.includes('excel')) return 'Spreadsheet';
  if (this.mimeType.includes('presentation') || this.mimeType.includes('powerpoint')) return 'Presentation';
  return 'Other';
});

// Virtual for formatted file size
documentSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Index for faster searches
documentSchema.index({ title: 'text', description: 'text' });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ category: 1 });

module.exports = mongoose.model('Document', documentSchema);