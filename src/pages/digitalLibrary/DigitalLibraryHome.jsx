import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDigitalLibraryContent, selectLibraryContent, selectLibraryStatus, selectLibraryError } from '../../features/digitalLibrary/digitalLibrarySlice';  
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { FileText, Video, Headphones, Image as ImageIcon } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

const DigitalLibraryHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const content = useSelector(selectLibraryContent) || [];
  const status = useSelector(selectLibraryStatus);
  const error = useSelector(selectLibraryError);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ['All', 'Document', 'Video', 'Audio', 'Image'];

  useEffect(() => {
    dispatch(fetchDigitalLibraryContent());
  }, [dispatch]);

  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleCategorySelect = (category) => { setSelectedCategory(category); setCurrentPage(1); };     

  // Normalize mapping for categories (convert string like "PDF" or "video")    
  const filteredContent = Array.isArray(content) ? content.filter(item => {     
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());   
    const catStr = (item.category || '').toLowerCase();
    const typeStr = (item.contentType || '').toLowerCase();
    const matchesCategory = selectedCategory === 'All' ||
                            catStr.includes(selectedCategory.toLowerCase()) ||  
                            typeStr.includes(selectedCategory.toLowerCase());   
    return matchesSearch && matchesCategory;
  }) : [];

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
    if (catStr.includes('pdf') || catStr.includes('document')) return <FileText className="w-5 h-5" />;
    if (catStr.includes('video')) return <Video className="w-5 h-5" />;
    if (catStr.includes('audio')) return <Headphones className="w-5 h-5" />;
    if (catStr.includes('image')) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Digital Library</h1>
          <p className="text-gray-600 mt-2">Explore our collection of learning materials.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex-1 w-full relative">
          <Input
            placeholder="Search library..."
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

      {status === 'loading' && <LoadingSkeleton className="h-[400px]" />}       
      {status === 'failed' && <div className="text-red-500 text-center py-8">Error: {error}</div>}

      {/* Content Grid */}
      {status === 'succeeded' && (
        <>
          <div className="mb-4 text-sm font-medium text-gray-500">
            Showing {filteredContent.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredContent.length)} of {filteredContent.length} materials
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedContent.length > 0 ? (
            paginatedContent.map(item => (
              <Card key={item._id} className="group flex flex-col h-[340px] rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden cursor-pointer" onClick={() => navigate(`/dashboard/digital-library/${item._id}`)}>
                {/* Top Image Section */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={getCoverImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite fallback loop
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
                  <CardTitle className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-gray-500 line-clamp-2 text-sm flex-1 mt-1">
                    {item.description}
                  </CardDescription>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-500 group-hover:text-brand-blue transition-colors">
                    <div className="flex items-center">
                      {getCategoryIcon(item.contentType || item.category)}
                      <span className="ml-2">Access Material</span>
                    </div>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))
          ) : (
             <div className="col-span-full text-center py-12 text-gray-500">    
                No materials found matching your criteria.
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
  );
};

export default DigitalLibraryHome;



