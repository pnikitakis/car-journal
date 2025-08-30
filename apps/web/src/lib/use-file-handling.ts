import { useState, useCallback } from 'react';
import { type Attachment } from '../types/event';
import {
  processFileAttachment,
  createTextAttachment,
  createImageThumbnail,
  cleanupAttachmentUrls,
  FileHandlingError,
} from './file-handling';

/**
 * File upload state
 */
export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * File handling hook return type
 */
export interface UseFileHandlingReturn {
  uploadState: FileUploadState;
  uploadFiles: (files: FileList | File[]) => Promise<Attachment[]>;
  createTextNote: (text: string, name?: string) => Attachment;
  generateThumbnail: (file: File) => Promise<string>;
  cleanupUrls: (attachments: Attachment[]) => void;
  clearError: () => void;
}

/**
 * Custom hook for handling file uploads and attachments
 */
export function useFileHandling(): UseFileHandlingReturn {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  /**
   * Clears any upload error
   */
  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Uploads multiple files and returns attachment objects
   */
  const uploadFiles = useCallback(async (files: FileList | File[]): Promise<Attachment[]> => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) {
      return [];
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      const attachments: Attachment[] = [];
      const totalFiles = fileArray.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        
        try {
          // Update progress
          setUploadState(prev => ({
            ...prev,
            progress: (i / totalFiles) * 100,
          }));

          // Process the file
          const attachment = await processFileAttachment(file);
          attachments.push(attachment);
        } catch (error) {
          // If one file fails, we still want to process the others
          // but we'll collect the error for the user
          const errorMessage = error instanceof FileHandlingError 
            ? error.message 
            : `Failed to process file: ${file.name}`;
          
          setUploadState(prev => ({
            ...prev,
            error: prev.error 
              ? `${prev.error}; ${errorMessage}`
              : errorMessage,
          }));
        }
      }

      // Complete the upload
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      return attachments;
    } catch (error) {
      const errorMessage = error instanceof FileHandlingError 
        ? error.message 
        : 'Failed to upload files';
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });

      return [];
    }
  }, []);

  /**
   * Creates a text note attachment
   */
  const createTextNote = useCallback((text: string, name?: string): Attachment => {
    try {
      return createTextAttachment(text, name);
    } catch (error) {
      const errorMessage = error instanceof FileHandlingError 
        ? error.message 
        : 'Failed to create text note';
      
      setUploadState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, []);

  /**
   * Generates a thumbnail for an image file
   */
  const generateThumbnail = useCallback(async (file: File): Promise<string> => {
    try {
      return await createImageThumbnail(file);
    } catch (error) {
      const errorMessage = error instanceof FileHandlingError 
        ? error.message 
        : 'Failed to generate thumbnail';
      
      setUploadState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, []);

  /**
   * Cleans up object URLs to prevent memory leaks
   */
  const cleanupUrls = useCallback((attachments: Attachment[]) => {
    cleanupAttachmentUrls(attachments);
  }, []);

  return {
    uploadState,
    uploadFiles,
    createTextNote,
    generateThumbnail,
    cleanupUrls,
    clearError,
  };
}