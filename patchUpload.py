with open("src/pages/digitalLibrary/UploadForm.jsx", "r", encoding="utf-8") as f:
    text = f.read()

import re

text = re.sub(
    r'import \{ uploadDigitalLibraryContent, selectLibraryStatus, selectLibraryError \} from \'../../features/digitalLibrary/digitalLibrarySlice\';',
    r"import { uploadDigitalLibraryContent, updateDigitalLibraryContent, selectLibraryStatus, selectLibraryError } from '../../features/digitalLibrary/digitalLibrarySlice';",
    text
)

text = re.sub(
    r'const UploadForm = \(\{ onUploadSuccess \}\) => \{',
    r'const UploadForm = ({ onUploadSuccess, editData, onCancel }) => {\n  const isEditMode = !!editData;',
    text
)

text = re.sub(
    r'const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);',
    r'''const [formData, setFormData] = useState({
    title: editData?.title || '',
    description: editData?.description || '',
    category: editData?.contentType || editData?.category?.toLowerCase() || '',
  });''',
    text
)

text = text.replace(
    r'''if (!file) {
      errors.file = "Please upload a file.";
    } else if (file.size > 100 * 1024 * 1024) { // 100MB limit
      errors.file = "File size cannot exceed 100MB.";
    }''',
    r'''if (!isEditMode && !file) {
      errors.file = "Please upload a file.";
    } else if (file && file.size > 100 * 1024 * 1024) { // 100MB limit
      errors.file = "File size cannot exceed 100MB.";
    }'''
)

text = text.replace(
    r'''    const payload = {
      title: formData.title,
      description: formData.description,
      category: 'General',
      contentType: formData.category.toLowerCase(),
      file: file,
    };

    const result = await dispatch(uploadDigitalLibraryContent(payload));        

    if (uploadDigitalLibraryContent.fulfilled.match(result)) {
      toast.success('Content uploaded successfully!');
      setFormData({ title: '', description: '', category: '' });
      setFile(null);
      setFormErrors({});
      if (onUploadSuccess) onUploadSuccess();
    } else {
      toast.error(result.payload || 'Upload failed');
    }''',
    r'''    let result;
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
    }'''
)

text = text.replace(
    r'<h2 className="text-2xl font-bold mb-6 text-brand-navy">Upload Material</h2>',
    r'<h2 className="text-2xl font-bold mb-6 text-brand-navy">{isEditMode ? "Edit Material" : "Upload Material"}</h2>'
)

text = text.replace(
    r'''        <Button
          type="submit" 
          disabled={status === 'loading'}
          className={status === 'loading' ? 'bg-gray-400 mt-6 w-full py-2 hover:bg-gray-400' : 'bg-brand-blue hover:bg-brand-navy mt-6 w-full py-2 text-white'} 
        >
          {status === 'loading' ? 'Uploading...' : 'Upload Material'}
        </Button>''',
    r'''        <div className="flex gap-4 mt-6">
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
        </div>'''
)

text = text.replace('required\n             onChange={(e) => {', 'required={!isEditMode}\n             onChange={(e) => {')

with open("src/pages/digitalLibrary/UploadForm.jsx", "w", encoding="utf-8") as f:
    f.write(text)
