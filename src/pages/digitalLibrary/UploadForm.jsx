import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDigitalLibraryContent, updateDigitalLibraryContent, selectLibraryStatus, selectLibraryError } from '../../features/digitalLibrary/digitalLibrarySlice';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const UploadForm = ({ onUploadSuccess, editData, onCancel }) => {
  const isEditMode = !!editData;
  const dispatch = useDispatch();
  const status = useSelector(selectLibraryStatus);
  const error = useSelector(selectLibraryError);

  const [formData, setFormData] = useState({
    title: editData?.title || '',
    description: editData?.description || '',
    category: editData?.contentType || editData?.category?.toLowerCase() || '',
  });
  const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let errors = {};
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    } else if (formData.title.length > 100) {
      errors.title = "Title cannot exceed 100 characters.";
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters long.";
    } else if (formData.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
    }

    if (!formData.category) {
      errors.category = "Please select a category.";
    }

    if (!isEditMode && !file) {
      errors.file = "Please upload a file.";
    } else if (file && file.size > 100 * 1024 * 1024) { // 100MB limit
      errors.file = "File size cannot exceed 100MB.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    let result;
    if (isEditMode) {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: editData.category || 'General',
        contentType: formData.category.toLowerCase(),
      };
      if (file) payload.file = file;

      result = await dispatch(updateDigitalLibraryContent({ id: editData._id, data: payload }));
      
      if (updateDigitalLibraryContent.fulfilled.match(result)) {
        toast.success('Content updated successfully!');
        setFormErrors({});
        if (onUploadSuccess) onUploadSuccess();
      } else {
        toast.error(result.payload || 'Update failed');
      }
    } else {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: 'General',
        contentType: formData.category.toLowerCase(),
        file: file,
      };

      result = await dispatch(uploadDigitalLibraryContent(payload));

      if (uploadDigitalLibraryContent.fulfilled.match(result)) {
        toast.success('Content uploaded successfully!');
        setFormData({ title: '', description: '', category: '' });
        setFile(null);
        setFormErrors({});
        if (onUploadSuccess) onUploadSuccess();
      } else {
        toast.error(result.payload || 'Upload failed');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-6 text-brand-navy">{isEditMode ? "Edit Material" : "Upload Material"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-700">Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            required
            minLength={3}
            maxLength={100}
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({...prev, title: e.target.value}));
              if (formErrors.title) setFormErrors(prev => ({...prev, title: null}));
            }}
            placeholder="Document title"
            className={`border-gray-200 focus-visible:ring-brand-blue ${formErrors.title ? 'border-red-500 ring-red-500' : ''}`}
          />
          {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700">Description <span className="text-red-500">*</span></Label>
          <textarea
            id="description"
            required
            minLength={10}
            maxLength={500}
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({...prev, description: e.target.value}));
              if (formErrors.description) setFormErrors(prev => ({...prev, description: null}));
            }}
            placeholder="Brief description of the material (max 500 characters)..."
            rows={4}
            className={`w-full flex rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.description ? 'border-red-500' : 'border-gray-200'}`}
          />
          {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-700">Category <span className="text-red-500">*</span></Label>
          <Select
            value={formData.category} 
            onValueChange={(val) => {
              setFormData(prev => ({...prev, category: val}));
              if (formErrors.category) setFormErrors(prev => ({...prev, category: null}));
            }}
          >
            <SelectTrigger id="category" className={`border-gray-200 focus:ring-brand-blue ${formErrors.category ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">Document (PDF)</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
        </div>

        <div className="space-y-2">
           <Label htmlFor="file" className="text-gray-700">File <span className="text-red-500">*</span></Label>
           <Input
             id="file"
             type="file"
             required={!isEditMode}
             onChange={(e) => {
               setFile(e.target.files[0]);
               if (formErrors.file) setFormErrors(prev => ({...prev, file: null}));
             }}
             className={`border-gray-200 text-gray-700 file:bg-gray-100 file:text-brand-navy file:rounded-md file:border-0 hover:file:bg-gray-200 transition-colors cursor-pointer pt-2 ${formErrors.file ? 'border-red-500 ring-red-500' : ''}`}
           />
           {formErrors.file && <p className="text-sm text-red-500">{formErrors.file}</p>}
        </div>

        <div className="flex gap-4 mt-6">
          {isEditMode && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-full py-2 border-gray-200" disabled={status === 'loading'}>
              Cancel
            </Button>
          )}
          <Button
            type="submit" 
            disabled={status === 'loading'}
            className={status === 'loading' ? 'bg-gray-400 w-full py-2 hover:bg-gray-400' : 'bg-brand-blue hover:bg-brand-navy w-full py-2 text-white'} 
          >
            {status === 'loading' ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Save Changes' : 'Upload Material')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
