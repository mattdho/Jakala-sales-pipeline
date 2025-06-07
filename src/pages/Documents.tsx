import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Search, Filter, Download, Eye, Trash2, 
  FileText, File, Folder, Calendar, User, Tag
} from 'lucide-react';
import { useJobs, useJobDocuments } from '../hooks/useSupabaseQuery';
import { uploadDocument, getDocumentUrl } from '../lib/supabase';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { useStore } from '../store/useStore';
import { DOCUMENT_TYPES } from '../constants';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, jobId: string, documentType: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const { data: jobsData } = useJobs();
  const jobs = jobsData?.data || [];

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && selectedJob && documentType) {
      onUpload(selectedFile, selectedJob, documentType);
      setSelectedFile(null);
      setSelectedJob('');
      setDocumentType('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Document
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 10MB)
              </p>
              <input
                type="file"
                onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Job *
              </label>
              <select
                required
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.job_code} - {job.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type *
              </label>
              <select
                required
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !selectedJob || !documentType}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Upload Document
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Documents: React.FC = () => {
  const { sidebarOpen, theme } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: jobsData } = useJobs();
  const jobs = jobsData?.data || [];

  // Get all documents from all jobs
  const allDocuments = jobs.flatMap(job => 
    job.documents?.map((doc: any) => ({ ...doc, job })) || []
  );

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.job.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || doc.type === selectedType;
    const matchesJob = !selectedJob || doc.job_id === selectedJob;
    
    return matchesSearch && matchesType && matchesJob;
  });

  const handleUpload = async (file: File, jobId: string, documentType: string) => {
    try {
      await uploadDocument(file, jobId, documentType);
      // Refresh data would happen automatically through React Query
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const getDocumentIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(t => t.id === type);
    return docType?.icon || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Header />
      <Sidebar />

      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-6`}>
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage project documents and files
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'Total Documents', value: allDocuments.length, icon: FileText, color: 'blue' },
                { title: 'Contracts', value: allDocuments.filter(d => d.type === 'contract').length, icon: File, color: 'green' },
                { title: 'Proposals', value: allDocuments.filter(d => d.type === 'proposal').length, icon: Folder, color: 'purple' },
                { title: 'This Month', value: allDocuments.filter(d => new Date(d.created_at).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'orange' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Types</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>

                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.job_code} - {job.name}</option>
                  ))}
                </select>

                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Job
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {getDocumentIcon(document.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{document.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Version {document.version}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {DOCUMENT_TYPES.find(t => t.id === document.type)?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{document.job.job_code}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{document.job.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(document.file_size)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(document.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              by {document.uploaded_by?.name || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => window.open(getDocumentUrl(document.file_path), '_blank')}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = getDocumentUrl(document.file_path);
                                link.download = document.name;
                                link.click();
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No documents found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your first document to get started.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default Documents;