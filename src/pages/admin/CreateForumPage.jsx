import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CreateForumForm from '../../components/forum/CreateForumForm.jsx';

const CreateForumPage = () => {
  const navigate = useNavigate();

  const handleForumCreated = () => {
    navigate('/admin/forums');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/forums')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition mb-4"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Forum</h1>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl">
        <CreateForumForm onForumCreated={handleForumCreated} />
      </div>
    </div>
  );
};

export default CreateForumPage;
