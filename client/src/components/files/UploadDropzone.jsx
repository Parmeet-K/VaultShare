import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
export function UploadDropzone({ onFiles, progress }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: true, onDrop: onFiles });
  return <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}><input {...getInputProps()} /><UploadCloud size={30} /><strong>{isDragActive ? 'Release to encrypt and upload' : 'Drop files to secure upload'}</strong><span>Multiple files, previews, validation, progress, and resumable hooks ready</span>{progress > 0 && <div className="progress"><i style={{ width: `${progress}%` }} /></div>}</div>;
}
