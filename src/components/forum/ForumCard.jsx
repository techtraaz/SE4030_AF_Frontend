import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForums } from '../../hooks/useForum';
import { AiOutlineTeam } from 'react-icons/ai';

const ForumCard = ({ forum, isMember }) => {
  const navigate = useNavigate();
  const { joinForum, leaveForum } = useForums();

  const handleJoinForum = async () => {
    try {
      await joinForum(forum._id);
    } catch (error) {
      console.error('Join forum error:', error);
    }
  };

  const handleLeaveForum = async () => {
    try {
      await leaveForum(forum._id);
    } catch (error) {
      console.error('Leave forum error:', error);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer p-4"
      role="article"
    >
      <div className="flex justify-between items-start gap-4">
        <div
          className="flex-1"
          onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
        >
          <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-500">
            {forum.name}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {forum.description}
          </p>
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <AiOutlineTeam size={16} />
            <span>{forum.memberCount || 0} members</span>
          </div>
        </div>

        <button
          onClick={() => (isMember ? handleLeaveForum() : handleJoinForum())}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
            isMember
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isMember ? 'Leave' : 'Join'}
        </button>
      </div>
    </div>
  );
};

export default ForumCard;