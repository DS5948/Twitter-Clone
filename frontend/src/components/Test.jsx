import React from 'react';
import { GoHeart } from 'react-icons/go';
import { FaRegComment } from 'react-icons/fa6';
import avatar from './assets/boy1.png';
import { AiOutlineDelete } from 'react-icons/ai';
import post from './assets/post2.png';

const Test = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="w-[600px] bg-white rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <img
              src={avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="block font-semibold text-gray-800">
                Dheeraj Sharma
                <span className="text-gray-500 ml-2">• 2d</span>
              </span>
              <span className="text-sm text-gray-500">@dheerajsharma2425</span>
            </div>
          </div>
          <AiOutlineDelete
            size={24}
            className="text-gray-500 hover:text-red-500 cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="text-gray-700 mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Non,
          voluptatem similique facilis explicabo vitae aspernatur accusamus
          officia consequuntur tenetur repellendus error quo sint suscipit
          quidem earum provident saepe eum omnis quae consectetur adipisci
          cumque a quibusdam pariatur! Voluptates iusto architecto esse rerum
          veniam, hic, dignissimos quis pariatur animi, obcaecati voluptatum!
        </div>

        {/* Image */}
        <div className="mb-4">
          <img
            src={post}
            alt="post content"
            className="w-full h-[300px] object-cover rounded-lg"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between text-gray-500 mb-2">
          <div className="flex items-center gap-6">
            <GoHeart className="text-xl hover:text-red-500 cursor-pointer" />
            <FaRegComment className="text-xl hover:text-blue-500 cursor-pointer" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <span>925 likes</span>
          <span>25 comments</span>
        </div>
      </div>
    </div>
  );
};

export default Test;
