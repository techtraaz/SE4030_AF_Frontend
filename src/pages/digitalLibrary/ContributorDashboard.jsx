import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDigitalLibraryContent, selectLibraryContent, selectLibraryStatus, selectLibraryError, deleteDigitalLibraryContent } from '../../features/digitalLibrary/digitalLibrarySlice';
import UploadForm from './UploadForm';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Trash2, Edit2, Plus, X, FileText, Video, Headphones, Image as ImageIcon, Eye } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { toastService } from '../../services/toastService';
import ConfirmationModal from '../../components/shared/ConfirmationModal';

const ContributorDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const content = useSelector(selectLibraryContent) || [];
  const status = useSelector(selectLibraryStatus);
  const error = useSelector(selectLibraryError);

  // NOTE: In a real app, you'd filter by user._id. For this MVP, we assume it's pre-filtered
  // by an endpoint or we mock the filter.
  const user = useSelector(state => state.auth.user);
  const myContent = Array.isArray(content) ? content.filter(item => item.uploaderId === user?._id) : [];
  const [showUpload, setShowUpload] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ['All', 'Document', 'Video', 'Audio', 'Image'];

  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleCategorySelect = (category) => { setSelectedCategory(category); setCurrentPage(1); };

  const filteredContent = myContent.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const catStr = (item.category || '').toLowerCase();
    const typeStr = (item.contentType || '').toLowerCase();
    const matchesCategory = selectedCategory === 'All' || catStr.includes(selectedCategory.toLowerCase()) || typeStr.includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const paginatedContent = filteredContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCoverImage = (item) => {
    if (item.contentType && item.contentType.toLowerCase().includes('image') && item.fileUrl) {
      return item.fileUrl; // Use the image itself if it's an image
    }
    // Fallbacks
    const type = (item.contentType || item.category || '').toLowerCase();       
    if (type.includes('video')) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    if (type.includes('audio')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    if (type.includes('document') || type.includes('pdf')) return 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1456953180671-730af0f30532?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Default general abstract
  };

  const getCategoryIcon = (category) => {
    const catStr = category?.toLowerCase() || '';
    if (catStr.includes('pdf') || catStr.includes('document')) return <FileText className="w-5 h-5 mb-0 mr-1 text-gray-500" />;
    if (catStr.includes('video')) return <Video className="w-5 h-5 mb-0 mr-1 text-blue-500" />;
    if (catStr.includes('audio')) return <Headphones className="w-5 h-5 mb-0 mr-1 text-green-500" />;
    if (catStr.includes('image')) return <ImageIcon className="w-5 h-5 mb-0 mr-1 text-purple-500" />;
    return <FileText className="w-5 h-5 mb-0 mr-1 text-gray-500" />;
  };

  useEffect(() => {
    dispatch(fetchDigitalLibraryContent());
  }, [dispatch]);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteDigitalLibraryContent(itemToDelete._id)).unwrap();
      toastService.success('Digital content deleted successfully!');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      toastService.error(err || 'Failed to delete content');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowUpload(true);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    dispatch(fetchDigitalLibraryContent());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Contributor Dashboard</h1>
          <p className="text-gray-600">Manage your educational materials.</p>   
        </div>
        <Button
          onClick={() => { setShowUpload(!showUpload); setEditingItem(null); }}
          className={showUpload ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-brand-blue hover:bg-brand-navy text-white"}
        >
          {showUpload ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showUpload ? 'Cancel' : 'Upload New Material'}
        </Button>
      </div>

      {showUpload && <UploadForm onUploadSuccess={handleUploadSuccess} editData={editingItem} onCancel={() => { setShowUpload(false); setEditingItem(null); }} />}      

      {!showUpload && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
           <h2 className="text-xl font-bold text-gray-800 border-b border-gray-50 pb-2 mb-4">Your Uploaded Materials</h2>

           {/* Filters and Search */}
           <div className="flex flex-col md:flex-row gap-4 mb-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
             <div className="flex-1 w-full relative">
               <Input
                 placeholder="Search your library..."
                 value={searchTerm}
                 onChange={handleSearch}
                 className="w-full bg-white"
               />
             </div>
             <div className="flex flex-wrap gap-2 w-full md:w-auto">
               {categories.map(cat => (
                 <Button
                   key={cat}
                   variant={selectedCategory === cat ? "default" : "outline"}
                   onClick={() => handleCategorySelect(cat)}
                   className="rounded-full"
                 >
                   {cat}
                 </Button>
               ))}
             </div>
           </div>

           {status === 'loading' && <LoadingSkeleton className="h-[200px]" />}  
           {status === 'failed' && <div className="text-red-500 py-4">Error loading content: {error}</div>}

           {status === 'succeeded' && (
<>
              <div className="mb-4 text-sm font-medium text-gray-500">
                Showing {filteredContent.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredContent.length)} of {filteredContent.length} materials
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                {paginatedContent.length > 0 ? (
                  paginatedContent.map(item => (
                    <Card key={item._id} className="group flex flex-col h-[340px] rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden">
                      {/* Top Image Section */}
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={getCoverImage(item)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://images.unsplash.com/photo-1456953180671-730af0f30532?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-brand-navy hover:bg-white border-0 text-xs font-semibold px-2.5 py-1 uppercase shadow-sm backdrop-blur-sm">
                            {item.contentType || item.category || 'General'}
                          </Badge>
                        </div>
                      </div>

                      {/* Bottom Content Section */}
                      <div className="flex-1 flex flex-col p-4">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-brand-blue transition-colors">
                            {item.title}
                          </CardTitle>
                        </div>
                        <p className="text-gray-500 line-clamp-2 text-sm flex-1 mt-1">
                          {item.description}
                        </p>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center text-sm font-medium text-gray-500">
                            {getCategoryIcon(item.contentType || item.category)} <span className="capitalize ml-1">{item.category}</span>
                          </div>
                          
                          <div className="flex gap-2">                              <Button onClick={() => navigate(`/dashboard/digital-library/${item._id}`)} variant="outline" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-brand-blue hover:bg-blue-50 border-gray-200" title="View">
                                <Eye className="w-4 h-4" />
                              </Button>                            <Button onClick={() => handleEditClick(item)} variant="outline" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-brand-blue hover:bg-blue-50 border-gray-200" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteClick(item)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 border-gray-200" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                   <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg text-gray-400 border border-dashed border-gray-300">
                       You haven't uploaded any materials yet. Click 'Upload New Material' to get started.
                   </div>
                )}
              </div>

              {totalPages > 1 && (
                  <div className="flex justify-center mt-10 gap-2">
                    <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <div className="flex items-center px-4 font-medium text-gray-700 bg-gray-50 rounded-md">Page {currentPage} of {totalPages}</div>
                    <Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                  </div>
              )}
              </>
           )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message="Are you sure you want to permanently delete this material? This action cannot be undone."
        confirmText="Delete"
        itemName={itemToDelete?.title}
        loading={isDeleting}
        type="delete"
      />
    </div>
  );
};

export default ContributorDashboard;






