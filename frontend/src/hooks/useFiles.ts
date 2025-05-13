import { useState, useCallback } from 'react';
import { fileApi } from '../services/api';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  path: string;
}

interface FileOperations {
  list: (path: string) => Promise<FileItem[]>;
  upload: (path: string, file: File) => Promise<void>;
  createFolder: (path: string, name: string) => Promise<void>;
  delete: (path: string) => Promise<void>;
  move: (source: string, destination: string) => Promise<void>;
  copy: (source: string, destination: string) => Promise<void>;
}

interface FileHook extends FileOperations {
  files: FileItem[];
  currentPath: string;
  isLoading: boolean;
  error: string | null;
  setCurrentPath: (path: string) => void;
}

const useFiles = (): FileHook => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fileApi.list(path);
      const fileList = response.data;
      setFiles(fileList);
      return fileList;
    } catch (error) {
      setError('Failed to list files');
      console.error('Error listing files:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upload = useCallback(async (path: string, file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileApi.upload(path, file);
      await list(currentPath); // Refresh the file list
    } catch (error) {
      setError('Failed to upload file');
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, list]);

  const createFolder = useCallback(async (path: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileApi.createFolder(path, name);
      await list(currentPath); // Refresh the file list
    } catch (error) {
      setError('Failed to create folder');
      console.error('Error creating folder:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, list]);

  const deleteFile = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileApi.delete(path);
      await list(currentPath); // Refresh the file list
    } catch (error) {
      setError('Failed to delete file');
      console.error('Error deleting file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, list]);

  const move = useCallback(async (source: string, destination: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileApi.move(source, destination);
      await list(currentPath); // Refresh the file list
    } catch (error) {
      setError('Failed to move file');
      console.error('Error moving file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, list]);

  const copy = useCallback(async (source: string, destination: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await fileApi.copy(source, destination);
      await list(currentPath); // Refresh the file list
    } catch (error) {
      setError('Failed to copy file');
      console.error('Error copying file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, list]);

  return {
    files,
    currentPath,
    isLoading,
    error,
    setCurrentPath,
    list,
    upload,
    createFolder,
    delete: deleteFile,
    move,
    copy,
  };
};

export default useFiles; 