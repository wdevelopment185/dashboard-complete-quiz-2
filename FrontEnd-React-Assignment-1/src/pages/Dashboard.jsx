import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { getDocumentStats, getDocumentTrends, getDocuments } from '../services/api';
import UserManagement from '../components/UserManagement';
import DocumentManagement from '../components/DocumentManagement';
import UploadPage from './UploadPage';
import {
  BookOpen,
  BarChart3,
  FileText,
  Upload,
  Bell,
  Folder,
  User,
  Settings,
  Search,
  TrendingUp,
  HardDrive,
  ClipboardList,
  Zap,
  Lightbulb,
  Users
} from 'lucide-react';

// Charts will be populated from real data (now using state below)
// Removed non-reactive variable.

// File-type colors for pie chart
const TYPE_COLORS = {
  PDF: '#3B82F6',
  Word: '#2563EB',
  Excel: '#10B981',
  PowerPoint: '#F59E0B',
  Text: '#6B7280',
  Others: '#EF4444'
};

// Removed non-reactive activityData variable (state used below)

const Dashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'users'
  const [stats, setStats] = useState({
    totalDocs: 0,
    storageUsed: 0,
    storageBytes: 0,
    activeAlerts: 0,
    monthlyUploads: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [activitySeries, setActivitySeries] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);

  // Load real stats from backend
  useEffect(() => {
    const loadStats = async () => {
      try {
        const docStatsResp = await getDocumentStats();
        const { stats } = docStatsResp || {};

        const totalDocs = stats?.totalDocuments || 0;
        const archivedDocs = stats?.archivedDocuments || 0;
        const totalSizeBytes = stats?.totalSize || 0;
        const storageUsedGb = totalSizeBytes / (1024 * 1024 * 1024);

        // Compute monthly uploads using documents list filtered by current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const docsResp = await getDocuments({ limit: 500, sortBy: 'createdAt', sortOrder: 'desc' });
        const documents = docsResp?.documents || [];
        const monthlyUploads = documents.filter(d => {
          const createdAt = new Date(d.createdAt);
          return createdAt >= startOfMonth && createdAt <= now && d.status !== 'deleted';
        }).length;

        setStats({
          totalDocs,
          storageUsed: storageUsedGb,
          storageBytes: totalSizeBytes,
          activeAlerts: archivedDocs,
          monthlyUploads
        });

        // Recent uploads from stats
        const rec = (stats?.recentUploads || []).map(d => ({
          id: d._id || d.id,
          title: d.title || d.originalName,
          createdAt: d.createdAt,
          size: d.size || 0,
          type: (d.originalName || '').split('.').pop()?.toUpperCase() || 'FILE',
          status: (d.status || 'active').charAt(0).toUpperCase() + (d.status || 'active').slice(1)
        }));
        setRecentDocs(rec);

        // Prepare document types pie data from actual file extensions
        const counters = { PDF: 0, Word: 0, Excel: 0, PowerPoint: 0, Text: 0, Others: 0 };
        documents.forEach(d => {
          const name = (d.originalName || d.title || '').toLowerCase();
          const parts = name.split('.');
          const ext = parts.length > 1 ? parts.pop() : '';
          if (['pdf'].includes(ext)) counters.PDF++;
          else if (['doc', 'docx'].includes(ext)) counters.Word++;
          else if (['xls', 'xlsx'].includes(ext)) counters.Excel++;
          else if (['ppt', 'pptx', 'ppx', 'ppyx'].includes(ext)) counters.PowerPoint++;
          else if (['txt', 'rtf'].includes(ext)) counters.Text++;
          else counters.Others++;
        });
        const typeSeries = Object.entries(counters)
          .map(([name, value]) => ({ name, value, color: TYPE_COLORS[name] || '#9CA3AF' }))
          .filter(item => item.value > 0);
        setDocTypeData(typeSeries);

        // Fetch upload trend series from backend (last 6 months)
        const trendsResp = await getDocumentTrends(6);
        const series = trendsResp?.series || [];
        setTrendData(series.map(s => ({ month: s.month, uploads: s.uploads, storage: s.storage })));

        // Build simple hourly activity from last 24h uploads
        const lastDayDocs = documents.filter(d => {
          const c = new Date(d.createdAt);
          return now - c <= 24 * 60 * 60 * 1000 && d.status !== 'deleted';
        });
        const hours = [0,4,8,12,16,20];
        const actData = hours.map(h => {
          const count = lastDayDocs.filter(d => {
            const hr = new Date(d.createdAt).getHours();
            return hr >= h && hr < h + 4;
          }).length;
            return { time: `${String(h).padStart(2,'0')}:00`, activity: count };
        });
        setActivitySeries(actData);
      } catch (e) {
        // If API fails, keep defaults
        console.error('Failed to load dashboard stats', e);
      }
    };

    loadStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Processing': return 'text-yellow-600 bg-yellow-50';
      case 'Archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const formatRelativeTime = (iso) => {
    if (!iso) return '';
    const now = new Date();
    const dt = new Date(iso);
    const diffMs = now - dt;
    const mins = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 60) return `Uploaded ${mins} minute${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `Uploaded ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `Uploaded ${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const formatSize = (bytes) => {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    if (bytes < KB) return `${bytes} Bytes`;
    if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
    if (bytes < GB) return `${(bytes / MB).toFixed(1)} MB`;
    return `${(bytes / GB).toFixed(2)} GB`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const [docTypeData, setDocTypeData] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <motion.aside 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-6 min-h-screen pt-8 shadow-lg"
        >
          {/* Brand header removed from sidebar as requested */}

          <nav className="mt-2">
            <ul className="space-y-2">
              {[
                { icon: BarChart3, label: 'Dashboard', view: 'overview', active: activeView === 'overview' },
                { icon: Users, label: 'User Management', view: 'users', active: activeView === 'users' },
                { icon: FileText, label: 'Documents', view: 'documents' },
                { icon: Upload, label: 'Upload', view: 'upload' },
                { icon: Bell, label: 'Alerts', view: 'alerts' },
                { icon: Folder, label: 'Folders', view: 'folders' },
                { icon: User, label: 'Profile', view: 'profile' },
                { icon: Settings, label: 'Settings', view: 'settings' }
              ].map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button 
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      item.active 
                        ? 'text-blue-700 bg-blue-50 shadow-sm border border-blue-100' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.aside>

        <div className="flex-1 relative">
          {/* Header shown only for Overview; hidden on Users/Documents/Upload */}
          {activeView === 'overview' && (
            <motion.header 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm"
            >
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {activeView === 'users' ? 'User Management' : 
                       activeView === 'documents' ? 'Document Management' : 
                       activeView === 'upload' ? 'Upload Documents' :
                       `Welcome back, ${user?.name || 'User'}!`}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {activeView === 'users' ? 'Manage all system users' : 
                       activeView === 'documents' ? 'Manage your documents and files' : 
                       activeView === 'upload' ? 'Upload and organize your files' :
                       "Here's your document management overview"}
                    </p>
                  </div>
                </div>

                {/* Right-side controls removed as requested */}
                <div className="flex items-center gap-4"></div>
              </div>
            </motion.header>
          )}

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Conditional Rendering based on activeView */}
            {activeView === 'users' ? (
              <UserManagement />
            ) : activeView === 'documents' ? (
              <DocumentManagement />
            ) : activeView === 'upload' ? (
              <UploadPage />
            ) : activeView === 'overview' ? (
              <>
            {/* Stats Cards */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {[
                { 
                  label: 'Total Documents', 
                  value: stats.totalDocs, 
                   
                  icon: FileText,
                  color: 'from-blue-500 to-blue-600'
                },
                { 
                  label: 'Storage Used', 
                  value: `${stats.storageUsed.toFixed(1)} GB`, 
                   
                  icon: HardDrive,
                  color: 'from-green-500 to-green-600'
                },
                { 
                  label: 'Active Alerts', 
                  value: stats.activeAlerts, 
                  icon: Bell,
                  color: 'from-yellow-500 to-orange-500'
                },
                { 
                  label: 'Monthly Uploads', 
                  value: stats.monthlyUploads, 
                  
                  icon: Upload,
                  color: 'from-purple-500 to-purple-600'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.label === 'Storage Used' ? (
                          (() => {
                            const bytes = stats.storageBytes || 0;
                            const KB = 1024;
                            const MB = KB * 1024;
                            const GB = MB * 1024;
                            if (bytes < KB) return `${bytes} Bytes`;
                            if (bytes < MB) return `${Math.round(bytes / KB)} KB`;
                            if (bytes < GB) return `${(bytes / MB).toFixed(2)} MB`;
                            return `${(bytes / GB).toFixed(2)} GB`;
                          })()
                        ) : (
                          <CountUp end={typeof stat.value === 'number' ? stat.value : 0} duration={1.2} />
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Upload Trends */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Upload Trends
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  {(() => {
                    const maxUploads = trendData.length ? Math.max(...trendData.map(d => d.uploads)) : 0;
                    const ticks = Array.from({ length: maxUploads + 1 }, (_, i) => i);
                    return (
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" allowDecimals={false} ticks={ticks} domain={[0, maxUploads]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: 'none', 
                            borderRadius: '12px', 
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="uploads" 
                          stroke="#3B82F6" 
                          fillOpacity={1} 
                          fill="url(#colorUploads)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    );
                  })()}
                </ResponsiveContainer>
              </motion.div>

              {/* Document Types */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Document Types
                </h3>
                {docTypeData.length === 0 || docTypeData.reduce((s,d)=>s+d.value,0) === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No documents uploaded
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={docTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {docTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>

            {/* Recent Documents & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Documents */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="h-6 w-6" />
                    Recent Documents
                  </h3>
                  <button 
                    onClick={() => setActiveView('documents')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-4">
                    {(!recentDocs || recentDocs.length === 0) ? (
                      <div className="h-[200px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl">
                        No recent documents
                      </div>
                    ) : recentDocs.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl shadow-lg">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{doc.title}</p>
                          <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-gray-500">{formatRelativeTime(doc.createdAt)}</p>
                              <span className="text-xs text-gray-400">• {formatSize(doc.size)}</span>
                              <span className="text-xs text-gray-400">• {doc.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status}
                        </span>
                        <Link
                          to={`/documents/${doc.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          Open
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Activity Chart */}
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Daily Activity
                </h3>
                {(activitySeries.length === 0 || activitySeries.every(d => d.activity === 0)) ? (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No activity in the last 24 hours
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activitySeries}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Bar 
                        dataKey="activity" 
                        fill="url(#colorActivity)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm font-medium text-blue-900 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Quick Tip
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Peak activity is between 12-16h. Consider scheduling bulk operations during off-peak hours.
                  </p>
                </div>
              </motion.div>
            </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                <p className="text-gray-600 text-lg">This section is coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
