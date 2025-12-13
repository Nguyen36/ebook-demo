import React from 'react';

const FileUploader = ({ onFile }) => {
  const handleChange = e => {
    const file = e.target.files[0];
      console.log('FILE UPLOADED:', file);
    if (file) onFile(file);
  };

  return (
    <input
      type="file"
      accept=".pdf,.docx"
      onChange={handleChange}
    />
  );
};

export default FileUploader;
