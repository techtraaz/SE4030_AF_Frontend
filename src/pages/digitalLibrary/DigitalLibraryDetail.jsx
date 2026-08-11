import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDigitalLibraryContent, selectLibraryContent, selectLibraryStatus } from '../../features/digitalLibrary/digitalLibrarySlice';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, ExternalLink, FileText, Video, Headphones, Image as ImageIcon } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';

const DigitalLibraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const content = useSelector(selectLibraryContent) || [];
  const status = useSelector(selectLibraryStatus);

  useEffect(() => {
    if (!content || content.length === 0) {
      dispatch(fetchDigitalLibraryContent());
    }
  }, [dispatch, content.length]);

  const item = content?.find((c) => c._id === id || c.id === id);

  if (status === 'loading' && !item) {
    return <div className="container mx-auto px-4 py-8 max-w-5xl"><LoadingSkeleton className="h-[400px]" /></div>;
  }
  
  if (!item && status === 'succeeded') {
    return <div className="container mx-auto px-4 py-16 text-center text-gray-500">Content not found.</div>;
  }
  
  if (!item) return null;

  const renderMediaViewer = () => {
    const type = (item.contentType || '').toLowerCase();
    const url = item.fileUrl; // From cloudinary
    
    if (!url) return <div className="p-8 bg-gray-50 rounded-lg text-center text-gray-500 border border-dashed border-gray-300">File link is empty</div>;

    if (type.includes('image')) {
      return (
        <div className="flex justify-center bg-gray-100/50 p-4 rounded-xl border border-gray-100">
           <img src={url} alt={item.title} className="max-w-full max-h-[600px] object-contain rounded shadow-sm" />
        </div>
      );
    }
    if (type.includes('video')) {
      return (
         <div className="flex justify-center bg-black p-4 rounded-xl shadow-sm">
           <video src={url} controls className="w-full max-h-[600px] rounded" />
         </div>
      );
    }
    if (type.includes('audio')) {
      return (
        <div className="w-full p-12 bg-blue-50/50 rounded-xl flex flex-col justify-center items-center border border-blue-100">
          <Headphones className="w-16 h-16 text-brand-blue/30 mb-6" />
          <audio src={url} controls className="w-full max-w-md" />
        </div>
      );
    }
    
    // Pass PDFs and Documents through Google Docs viewer for universal iframe support
    if (type.includes('pdf') || type.includes('document')) {
      return (
        <div className="w-full aspect-video min-h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex flex-col relative">
          <iframe 
            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} 
            className="w-full flex-1" 
            title={item.title} 
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    // Generic Fallback
    return (
      <div className="w-full aspect-video min-h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 flex flex-col">
        <iframe src={url} className="w-full flex-1" title={item.title} />
      </div>
    );
  };

  const getCategoryIcon = (category) => {
    const catStr = category?.toLowerCase() || '';
    if (catStr.includes('pdf') || catStr.includes('document')) return <FileText className="w-5 h-5 text-red-500" />;
    if (catStr.includes('video')) return <Video className="w-5 h-5 text-blue-500" />;
    if (catStr.includes('audio')) return <Headphones className="w-5 h-5 text-green-500" />;
    if (catStr.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-full pl-2 pr-4 transition-all">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Button>

      <Card className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-2xl">
        <div className="p-8 border-b border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {getCategoryIcon(item.contentType || item.category)}
                </div>
                <Badge variant="secondary" className="px-3 py-1 uppercase tracking-wider text-[10px] font-semibold bg-brand-blue/10 text-brand-blue border-none">
                  {item.contentType || item.category || 'General'}
                </Badge>

              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">{item.title}</h1>
              <p className="text-gray-600 leading-relaxed text-lg mt-4 whitespace-pre-wrap">{item.description}</p>
            </div>
            
            {item.fileUrl && (
              <Button asChild className="bg-white border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors shrink-0 shadow-sm">
                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Original File
                </a>
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-6 md:p-8 bg-[#fafafa]">
          {renderMediaViewer()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalLibraryDetail;
