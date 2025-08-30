'use client';

import { useState, useRef, useCallback } from 'react';
import { type Attachment } from '../types/event';
import { useFileHandling } from '../lib/use-file-handling';
import { formatFileSize, getAttachmentDisplayName, canPreviewInline } from '../lib/file-handling';

interface FileUploadProps {
  onFilesUploaded?: (attachments: Attachment[]) => void;
  onTextNoteAdded?: (attachment: Attachment) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({ 
  onFilesUploaded, 
  onTextNoteAdded, 
  maxFiles = 10,
  className = '' 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textNote, setTextNote] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const { uploadState, uploadFiles, createTextNote, clearError } = useFileHandling();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    clearError();
    
    try {
      const newAttachments = await uploadFiles(files);
      
      if (newAttachments.length > 0) {
        const updatedAttachments = [...attachments, ...newAttachments];
        setAttachments(updatedAttachments);
        onFilesUploaded?.(newAttachments);
      }
    } catch (error) {
      console.error('File upload failed:', error);
    }
  }, [attachments, uploadFiles, onFilesUploaded, clearError]);

  const handleTextNoteSubmit = useCallback(() => {
    if (!textNote.trim()) return;

    try {
      const attachment = createTextNote(textNote.trim());
      const updatedAttachments = [...attachments, attachment];
      setAttachments(updatedAttachments);
      onTextNoteAdded?.(attachment);
      setTextNote('');
      setShowTextInput(false);
    } catch (error) {
      console.error('Text note creation failed:', error);
    }
  }, [textNote, attachments, createTextNote, onTextNoteAdded]);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="image/*,.pdf,audio/*,.txt,.csv,.json,.xml,.doc,.docx,.xls,.xlsx,.zip"
        />
        
        <div className="space-y-2">
          <div className="text-gray-600">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </button>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-sm text-gray-500">
            Images, PDFs, audio files, and documents up to 10MB each
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">
              Uploading files... {Math.round(uploadState.progress)}%
            </span>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">{uploadState.error}</p>
              <button
                type="button"
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                onClick={clearError}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Note Input */}
      <div className="space-y-2">
        {!showTextInput ? (
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            onClick={() => setShowTextInput(true)}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add text note</span>
          </button>
        ) : (
          <div className="border border-gray-300 rounded-lg p-3 space-y-3">
            <textarea
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder="Enter your note..."
              className="w-full h-24 p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setShowTextInput(false);
                  setTextNote('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleTextNoteSubmit}
                disabled={!textNote.trim()}
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Attachments ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                attachment={attachment}
                onRemove={handleRemoveAttachment}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AttachmentItemProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentItem({ attachment, onRemove }: AttachmentItemProps) {
  const displayName = getAttachmentDisplayName(attachment);
  const canPreview = canPreviewInline(attachment);

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* File Icon/Preview */}
      <div className="flex-shrink-0">
        {attachment.kind === 'image' && attachment.url ? (
          <img
            src={attachment.url}
            alt={displayName}
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-300 rounded flex items-center justify-center">
            <FileIcon kind={attachment.kind} />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {displayName}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="capitalize">{attachment.kind}</span>
          {attachment.sizeBytes && (
            <>
              <span>•</span>
              <span>{formatFileSize(attachment.sizeBytes)}</span>
            </>
          )}
        </div>
        {attachment.kind === 'text' && attachment.textBody && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {attachment.textBody}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
        onClick={() => onRemove(attachment.id)}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

function FileIcon({ kind }: { kind: string }) {
  const icons = {
    pdf: '📄',
    audio: '🎵',
    file: '📎',
    text: '📝',
  };

  return (
    <span className="text-lg">
      {icons[kind as keyof typeof icons] || '📎'}
    </span>
  );
}