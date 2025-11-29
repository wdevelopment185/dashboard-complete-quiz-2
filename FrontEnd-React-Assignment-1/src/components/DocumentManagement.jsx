import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Archive,
  X,
  Plus,
  RefreshCw,
  Grid,
  List,
  Calendar,
  User,
  Tag,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import * as api from '../services/api';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  // Selected document
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Upload form data
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: false
  });
  
  // Edit form data
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    tags: '',
    isPublic: false
  });
  
  // Messages
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocuments: 0
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pdf', label: 'PDF' },
    { value: 'document', label: 'Documents' },
    { value: 'textfiles', label: 'Text Files' },
    { value: 'spreadsheet', label: 'Spreadsheets' },
    { value: 'presentation', label: 'Presentations' }
  ];

  // Map file extensions to categories
  const getFileCategory = (filename) => {
    if (!filename) return 'other';
    const ext = filename.toLowerCase().split('.').pop();
    
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['txt', 'rtf'].includes(ext)) return 'textfiles';
    if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext)) return 'presentation';
    return 'other';
  };

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  // Fetch documents
  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        status: selectedStatus,
        search: searchQuery || undefined
      };

      const response = await api.getDocuments(params);
      let docs = response.documents || [];
      
      // Filter by selected category based on file type
      if (selectedCategory !== 'all') {
        docs = docs.filter(doc => {
          const docCategory = getFileCategory(doc.originalName || doc.title);
          return docCategory === selectedCategory;
        });
      }

      setDocuments(docs);
      setFilteredDocuments(docs);
      
      // Update pagination to reflect filtered results
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(docs.length / 12) || 1,
        totalDocuments: docs.length
      });
      
      if (message.type === 'error') {
        setMessage({ text: '', type: '' });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch documents',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload documents
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (uploadFiles.length === 0) {
      setMessage({ text: 'Please select files to upload', type: 'error' });
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add files
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', 'document');
      formData.append('tags', uploadData.tags);
      formData.append('isPublic', uploadData.isPublic);
      
      const response = await api.uploadDocument(formData);
      
      setMessage({
        text: response.message || 'Files uploaded successfully',
        type: 'success'
      });
      
      // Reset form
      setUploadFiles([]);
      setUploadData({
        title: '',
        description: '',
        tags: '',
        isPublic: false
      });
      
      setShowUploadModal(false);
      fetchDocuments(pagination.currentPage);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        text: error.response?.data?.message || 'Upload failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update document
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await api.updateDocument(selectedDocument._id, editData);
      
      setMessage({
        text: response.message || 'Document updated successfully',
        type: 'success'
      });
      
      setShowEditModal(false);
      fetchDocuments(pagination.currentPage);
      
    } catch (error) {
      console.error('Update error:', error);
      setMessage({
        text: error.response?.data?.message || 'Update failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete document
  const handleDelete = async () => {
    setSubmitting(true);
    
    try {
      await api.deleteDocument(selectedDocument._id);
      
      setMessage({
        text: 'Document deleted successfully',
        type: 'success'
      });
      
      setShowDeleteModal(false);
      fetchDocuments(pagination.currentPage);
      
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({
        text: error.response?.data?.message || 'Delete failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Archive document
  const handleArchive = async () => {
    setSubmitting(true);
    
    try {
      const newStatus = selectedDocument.status === 'archived' ? 'active' : 'archived';
      await api.updateDocumentStatus(selectedDocument._id, newStatus);
      
      setMessage({
        text: `Document ${newStatus === 'archived' ? 'archived' : 'unarchived'} successfully`,
        type: 'success'
      });
      
      setShowArchiveModal(false);
      fetchDocuments(pagination.currentPage);
      
    } catch (error) {
      console.error('Archive error:', error);
      setMessage({
        text: error.response?.data?.message || 'Archive action failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Download document
  const handleDownload = async (document) => {
    try {
      const response = await fetch(`/api/documents/${document._id}/download`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      setMessage({
        text: 'Download failed',
        type: 'error'
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const allowed = new Set(['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx', '.xls', '.xlsx']);
    const accepted = [];
    const rejected = [];

    files.forEach(file => {
      const ext = '.' + file.name.toLowerCase().split('.').pop();
      if (allowed.has(ext)) accepted.push(file); else rejected.push(file.name);
    });

    if (rejected.length) {
      setMessage({
        text: `Unsupported files skipped: ${rejected.slice(0,3).join(', ')}${rejected.length>3?` (+${rejected.length-3} more)`:''}`,
        type: 'error'
      });
    }

    setUploadFiles(accepted);
  };

  // Open edit modal
  const openEditModal = (document) => {
    setSelectedDocument(document);
    setEditData({
      title: document.title,
      description: document.description || '',
      tags: document.tags ? document.tags.join(', ') : '',
      isPublic: document.isPublic
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (document) => {
    setSelectedDocument(document);
    setShowDeleteModal(true);
  };

  // Open archive modal
  const openArchiveModal = (document) => {
    setSelectedDocument(document);
    setShowArchiveModal(true);
  };

  // Open view modal
  const openViewModal = (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  // Get file icon based on type
  const getFileIcon = (document) => {
    const type = document.fileType;
    switch (type) {
      case 'Image': return '🖼️';
      case 'PDF': return '📄';
      case 'Video': return '🎥';
      case 'Audio': return '🎵';
      case 'Document': return '📝';
      case 'Spreadsheet': return '📊';
      case 'Presentation': return '📋';
      default: return '📁';
    }
  };

  // Effects
  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedStatus, searchQuery]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your documents and files
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </button>
              <button
                onClick={() => fetchDocuments(pagination.currentPage)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-60 px-6 py-3 rounded-lg text-white shadow-lg ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No documents match your search criteria' : 'Start by uploading some documents'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Documents
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{getFileIcon(doc)}</div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openViewModal(doc)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(doc)}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openArchiveModal(doc)}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-2 truncate" title={doc.title}>
                        {doc.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {doc.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{doc.formattedSize}</span>
                        <span>{doc.fileType}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Document</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Uploaded By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <motion.tr
                        key={doc._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getFileIcon(doc)}</span>
                            <div>
                              <div className="font-medium text-gray-900 truncate" style={{ maxWidth: '200px' }}>
                                {doc.title}
                              </div>
                              {doc.description && (
                                <div className="text-sm text-gray-500 truncate" style={{ maxWidth: '200px' }}>
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {doc.fileType}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {doc.formattedSize}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openViewModal(doc)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(doc)}
                              className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openArchiveModal(doc)}
                              className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(doc)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchDocuments(pagination.currentPage - 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => fetchDocuments(i + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchDocuments(pagination.currentPage + 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upload Documents</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
                    required
                  />
                  {uploadFiles.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {uploadFiles.length} file(s) selected
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Document description"
                  />
                </div>

                {/* Category removed: uploads are documents-only */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={uploadData.isPublic}
                    onChange={(e) => setUploadData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                    Make document public
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadFiles.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Upload Files</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Edit Document</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Category removed in edit: documents remain categorized as 'document' */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editData.tags}
                    onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={editData.isPublic}
                    onChange={(e) => setEditData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="editIsPublic" className="ml-2 text-sm text-gray-700">
                    Make document public
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Update Document</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-red-600">Confirm Delete</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete "{selectedDocument.title}"?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Document Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getFileIcon(selectedDocument)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      {selectedDocument.title}
                    </h3>
                    {selectedDocument.description && (
                      <p className="text-gray-700 mb-4">
                        {selectedDocument.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Type
                    </label>
                    <p className="text-gray-900">{selectedDocument.fileType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Size
                    </label>
                    <p className="text-gray-900">{selectedDocument.formattedSize}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <p className="text-gray-900 capitalize">{selectedDocument.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <p className="text-gray-900 capitalize">{selectedDocument.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uploaded By
                    </label>
                    <p className="text-gray-900">
                      {selectedDocument.uploadedBy?.firstName} {selectedDocument.uploadedBy?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Date
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedDocument.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Filename
                    </label>
                    <p className="text-gray-900 truncate" title={selectedDocument.originalName}>
                      {selectedDocument.originalName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Download Count
                    </label>
                    <p className="text-gray-900">{selectedDocument.downloadCount || 0}</p>
                  </div>
                </div>

                {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedDocument);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openArchiveModal(selectedDocument);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{selectedDocument.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      openDeleteModal(selectedDocument);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchiveModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowArchiveModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-orange-600">
                  {selectedDocument.status === 'archived' ? 'Confirm Unarchive' : 'Confirm Archive'}
                </h2>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  {selectedDocument.status === 'archived' 
                    ? `Are you sure you want to unarchive "${selectedDocument.title}"?` 
                    : `Are you sure you want to archive "${selectedDocument.title}"?`
                  }
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedDocument.status === 'archived' 
                    ? 'The document will be moved back to active documents.' 
                    : 'The document will be moved to archived documents.'
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{selectedDocument.status === 'archived' ? 'Unarchive' : 'Archive'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentManagement;