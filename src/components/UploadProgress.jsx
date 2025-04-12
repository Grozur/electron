import React from "react";

const UploadProgressBar = ({ progress, speed }) => {
  return (
    <div className="w-full bg-gray-700 rounded-lg p-2 mt-4">
      <div className="flex justify-between text-white text-sm mb-1">
        <span>Uploading...</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded h-2">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-gray-300 text-xs mt-1">{speed} MB/s</div>
    </div>
  );
};

export default UploadProgressBar;
