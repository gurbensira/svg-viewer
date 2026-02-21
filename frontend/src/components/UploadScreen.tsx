import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDesign } from '../services/api.service';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

const ACCEPTED_FILE_TYPE = '.svg';

const UploadScreen = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadStatus('idle');
    setErrorMessage(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadStatus('loading');
    setErrorMessage(null);

    try {
      await uploadDesign(selectedFile);
      setUploadStatus('success');
      setTimeout(() => navigate('/designs'), 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('error');
    }
  }, [selectedFile, navigate]);

  const isUploading = uploadStatus === 'loading';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">SVG Viewer</h1>
        <p className="text-gray-500 mb-8">Upload an SVG file to parse and preview it.</p>

        <label className="block mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">SVG File</span>
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPE}
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>

        {selectedFile && (
          <p className="text-sm text-gray-500 mb-4 truncate">
            Selected: <span className="font-medium text-gray-700">{selectedFile.name}</span>
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
            disabled:bg-indigo-300 disabled:cursor-not-allowed
            transition-colors duration-150"
        >
          {isUploading ? 'Uploading…' : 'Upload'}
        </button>

        {uploadStatus === 'success' && (
          <p className="mt-4 text-sm text-green-600 font-medium text-center">
            Upload successful! Redirecting…
          </p>
        )}

        {uploadStatus === 'error' && errorMessage && (
          <p className="mt-4 text-sm text-red-600 font-medium text-center">
            {errorMessage}
          </p>
        )}

        <button
          onClick={() => navigate('/designs')}
          className="mt-6 w-full text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
        >
          View all designs →
        </button>
      </div>
    </div>
  );
};

export default UploadScreen;
