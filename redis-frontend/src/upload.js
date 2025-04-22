import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileUpload } from 'react-icons/fa';

const CSVUpload = ({ onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);

    try {
      const response = await axios.post('http://localhost:5000/residents/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success handling
      toast.success(`Successfully imported ${response.data.totalImported} residents`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        toast.warn(`${response.data.errors.length} residents failed to import`);
        console.warn('Import Errors:', response.data.errors);
      }

      // Optional: Trigger parent component to refresh data
      if (onImportSuccess) {
        onImportSuccess();
      }

      // Reset file selection
      setSelectedFile(null);
      
    } catch (error) {
      toast.error('Error uploading CSV file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="file-input-wrapper">
        <input 
          type="file" 
          accept=".csv"
          onChange={handleFileSelect}
          id="csv-file-input"
          className="file-input"
        />
        <label htmlFor="csv-file-input" className="file-input-label">
          <FaFileUpload /> Choose CSV File
        </label>
        {selectedFile && (
          <span className="selected-file-name">
            {selectedFile.name}
          </span>
        )}
      </div>
      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
        className="upload-btn"
      >
        {uploading ? 'Uploading...' : 'Import Residents'}
      </button>
    </div>
  );
};

export default CSVUpload;