'use client';

import { useState } from 'react';
import { Attachment } from '../types';
import { formatFileSize } from '../lib/format-utils';

interface AttachmentGalleryProps {
  attachments: Attachment[];
  className?: string;
}

export function AttachmentGallery({ attachments, className = '' }: AttachmentGalleryProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  const getAttachmentIcon = (attachment: Attachment) => {
    switch (attachment.kind) {
      case 'image':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-2.21-.895-4.21-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.984 5.984 0 01-.757 2.829 1 1 0 11-1.415-1.415A3.984 3.984 0 0013 12a3.983 3.983 0 00-.172-1.414 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const renderAttachmentPreview = (attachment: Attachment) => {
    switch (attachment.kind) {
      case 'image':
        return attachment.url ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedAttachment(attachment)}
          />
        ) : (
          <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {getAttachmentIcon(attachment)}
          </div>
        );
      
      case 'text':
        return (
          <div
            className="w-full h-24 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors overflow-hidden"
            onClick={() => setSelectedAttachment(attachment)}
          >
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-4">
              {attachment.textBody || 'Text note'}
            </p>
          </div>
        );
      
      default:
        return (
          <div
            className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setSelectedAttachment(attachment)}
          >
            {getAttachmentIcon(attachment)}
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center px-1">
              {attachment.kind.toUpperCase()}
            </span>
          </div>
        );
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="space-y-2">
            {renderAttachmentPreview(attachment)}
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p className="truncate" title={attachment.name}>
                {attachment.name}
              </p>
              {attachment.sizeBytes && (
                <p className="text-gray-500 dark:text-gray-500">
                  {formatFileSize(attachment.sizeBytes)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full-size attachment viewer */}
      {selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedAttachment(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-h-full">
              {selectedAttachment.kind === 'image' && selectedAttachment.url ? (
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.name}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : selectedAttachment.kind === 'text' ? (
                <div className="p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {selectedAttachment.name}
                  </h3>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedAttachment.textBody}
                  </pre>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500">
                    {getAttachmentIcon(selectedAttachment)}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {selectedAttachment.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedAttachment.kind.toUpperCase()} file
                    {selectedAttachment.sizeBytes && ` • ${formatFileSize(selectedAttachment.sizeBytes)}`}
                  </p>
                  {selectedAttachment.url && (
                    <a
                      href={selectedAttachment.url}
                      download={selectedAttachment.name}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}