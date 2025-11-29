import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument } from '../services/api';

const formatSize = (bytes = 0) => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes < KB) return `${bytes} Bytes`;
  if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
  if (bytes < GB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${(bytes / GB).toFixed(2)} GB`;
};

export default function DocumentDetails() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDocument(id);
        setDoc(res.document);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading…</div>;
  }
  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
  }
  if (!doc) {
    return <div className="max-w-4xl mx-auto p-6">Document not found.</div>;
  }

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{doc.title || doc.originalName}</h2>
        <Link className="text-blue-600" to="/dashboard">← Back to Dashboard</Link>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Filename</p>
            <p className="font-medium">{doc.originalName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium">{formatSize(doc.size)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{doc.mimeType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{doc.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uploaded</p>
            <p className="font-medium">{new Date(doc.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">By</p>
            <p className="font-medium">{doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <a
            href={`${backend}/api/documents/${doc._id}/download`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
