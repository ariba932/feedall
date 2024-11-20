import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  onChange,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange(acceptedFiles);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { 'application/octet-stream': [accept] } : undefined,
    multiple,
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : `Drag 'n' drop ${multiple ? 'files' : 'a file'} here, or click to select`}
        </p>
        {accept && (
          <p className="mt-1 text-xs text-gray-500">
            Accepted file types: {accept.replace('*', 'all')}
          </p>
        )}
      </div>
    </div>
  );
};
