import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Film, 
  Music, 
  Archive, 
  File, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Download,
  Tag,
  FolderOpen,
  Cloud,
  HardDrive,
  Users,
  Lock,
  Unlock,
  Info,
  Folder
} from 'lucide-react';
import * as api from '../services/api';

const UploadPage = () => {
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [recentUploads, setRecentUploads] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Form data for batch upload
  const [batchData, setBatchData] = useState({
    tags: '',
    isPublic: false,
    description: ''
  });

  // Category selection removed; uploads are documents-only

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return { icon: Image, color: 'text-green-500' };
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) return { icon: Film, color: 'text-purple-500' };
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return { icon: Music, color: 'text-yellow-500' };
    if (['pdf'].includes(ext)) return { icon: FileText, color: 'text-red-500' };
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return { icon: FileText, color: 'text-blue-500' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { icon: Archive, color: 'text-gray-500' };
    return { icon: File, color: 'text-gray-500' };
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  // Add files to upload queue
  const addFiles = (files) => {
    const allowed = new Set(['.pdf', '.doc', '.docx', '.txt', '.rtf', '.ppt', '.pptx', '.xls', '.xlsx']);
    const accepted = [];
    const rejected = [];

    files.forEach(file => {
      const ext = '.' + file.name.toLowerCase().split('.').pop();
      if (allowed.has(ext)) {
        accepted.push({
          id: Date.now() + Math.random(),
          file,
          status: 'pending',
          progress: 0,
          error: null
        });
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length) {
      setMessage({
        text: `Unsupported files skipped: ${rejected.slice(0,3).join(', ')}${rejected.length>3?` (+${rejected.length-3} more)`:''}`,
        type: 'error'
      });
    }

    if (accepted.length) {
      setUploadFiles(prev => [...prev, ...accepted]);
    }
  };

  // Remove file from queue
  const removeFile = (id) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  // Upload files
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending' || f.status === 'error');

    for (const fileObj of pendingFiles) {
      try {
        // Update status to uploading
        setUploadFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        const formData = new FormData();
        formData.append('files', fileObj.file);
        formData.append('category', 'document');
        formData.append('tags', batchData.tags);
        formData.append('isPublic', batchData.isPublic);
        formData.append('description', batchData.description);

        const response = await api.uploadDocument(formData);

        // Update status to success
        setUploadFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f
        ));

      } catch (error) {
        // Update status to error
        setUploadFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'error', 
            progress: 0, 
            error: error.response?.data?.message || 'Upload failed'
          } : f
        ));
      }
    }

    setUploading(false);
    setMessage({
      text: 'Upload process completed',
      type: 'success'
    });

    // Fetch recent uploads
    fetchRecentUploads();
  };

  // Fetch recent uploads
  const fetchRecentUploads = async () => {
    try {
      const response = await api.getDocuments({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
      setRecentUploads(response.documents || []);
    } catch (error) {
      console.error('Error fetching recent uploads:', error);
    }
  };

  // Get upload statistics
  const getUploadStats = () => {
    const total = uploadFiles.length;
    const success = uploadFiles.filter(f => f.status === 'success').length;
    const error = uploadFiles.filter(f => f.status === 'error').length;
    const pending = uploadFiles.filter(f => f.status === 'pending').length;
    const uploading = uploadFiles.filter(f => f.status === 'uploading').length;
    
    const totalSize = uploadFiles.reduce((acc, f) => acc + f.file.size, 0);
    
    return {
      total,
      success,
      error,
      pending,
      uploading,
      totalSize: formatFileSize(totalSize)
    };
  };

  const stats = getUploadStats();

  // Clear completed uploads
  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  // Retry failed uploads
  const retryFailed = () => {
    setUploadFiles(prev => prev.map(f => 
      f.status === 'error' ? { ...f, status: 'pending', error: null } : f
    ));
  };

  // Clear all uploads
  const clearAll = () => {
    setUploadFiles([]);
  };

  // Effects
  useEffect(() => {
    fetchRecentUploads();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Messages */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-40 px-6 py-3 rounded-lg text-white shadow-lg max-w-md ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Upload Documents</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Drag and drop your files here or click to browse. Supported formats include documents, images, videos, and archives.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-gray-700">
                    <span className="font-medium text-gray-900">{stats.total}</span> files
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium text-gray-900">{stats.totalSize}</span> total
                  </div>
                  {stats.success > 0 && (
                    <div className="text-green-600">
                      <span className="font-medium">{stats.success}</span> completed
                    </div>
                  )}
                  {stats.error > 0 && (
                    <div className="text-red-600">
                      <span className="font-medium">{stats.error}</span> failed
                    </div>
                  )}
                  {stats.uploading > 0 && (
                    <div className="text-blue-600">
                      <span className="font-medium">{stats.uploading}</span> uploading
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {stats.success > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Clear Completed
                    </button>
                  )}
                  {stats.error > 0 && (
                    <button
                      onClick={retryFailed}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      Retry Failed
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Drop Zone */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative border-2 border-dashed rounded-md p-12 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
              />
              
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Select Files
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX (max 50MB each)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </button>
              </div>
            </motion.div>

            {/* File List */}
            {uploadFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border border-gray-200 rounded-md"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Selected Files ({uploadFiles.length})</h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {uploadFiles.map((fileObj) => {
                    const { icon: FileIcon, color } = getFileIcon(fileObj.file.name);
                    
                    return (
                      <motion.div
                        key={fileObj.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileIcon className={`w-6 h-6 ${color} flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileObj.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileObj.file.size)}
                            </p>
                            {fileObj.error && (
                              <p className="text-xs text-red-600 mt-1">
                                {fileObj.error}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Status */}
                          {fileObj.status === 'success' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {fileObj.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          {fileObj.status === 'uploading' && (
                            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                          )}
                          {fileObj.status === 'pending' && (
                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                          )}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            disabled={fileObj.status === 'uploading'}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Upload Settings */}
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Upload Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title (optional)
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={batchData.title || ''}
                    onChange={(e) => setBatchData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Document title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    value={batchData.description}
                    onChange={(e) => setBatchData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    rows={3}
                    placeholder="Document description"
                  />
                </div>

                {/* Category removed: uploads are treated as documents */}

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={batchData.tags}
                    onChange={(e) => setBatchData(prev => ({ ...prev, tags: e.target.value }))}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={batchData.isPublic}
                    onChange={(e) => setBatchData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make document public
                  </label>
                </div>
              </div>

              {/* Upload Button */}
              {uploadFiles.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || stats.pending === 0}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Uploading files...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload {stats.pending} file{stats.pending !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Upload Tips */}
            <div className="mt-8 bg-blue-50 rounded-md p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Upload Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Maximum file size: 50MB per file</li>
                <li>• Supported formats: PDF, DOC, DOCX, TXT, RTF, PPT, PPTX, XLS, XLSX</li>
                <li>• Non-text files (images/audio/video/archives) are not permitted</li>
                <li>• Multiple files can be uploaded simultaneously</li>
                <li>• Use descriptive titles and tags for better organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;