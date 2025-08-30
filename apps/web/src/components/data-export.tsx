'use client';

import { useState } from 'react';
import { exportData, importData, clearAllData, getStorageStats } from '../lib/storage';
import { generateSalePackHTML, downloadHTML, printHTML } from '../lib/export-utils';

interface DataExportProps {
  className?: string;
}

export function DataExport({ className = '' }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [storageStats, setStorageStats] = useState(getStorageStats());

  const handleJSONExport = async () => {
    try {
      setIsExporting(true);
      
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `car-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSalePackExport = async () => {
    try {
      setIsExporting(true);
      
      const html = generateSalePackHTML({
        title: 'Vehicle Sale Pack',
        maxEvents: 20,
        includeAttachments: true
      });
      
      const filename = `vehicle-sale-pack-${new Date().toISOString().split('T')[0]}.html`;
      downloadHTML(html, filename);
    } catch (error) {
      console.error('Sale pack export failed:', error);
      alert('Failed to generate sale pack. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSalePackPrint = async () => {
    try {
      const html = generateSalePackHTML({
        title: 'Vehicle Sale Pack',
        maxEvents: 20,
        includeAttachments: true
      });
      
      printHTML(html);
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to open print dialog. Please try again.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportFile(file || null);
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      setIsImporting(true);
      
      const text = await importFile.text();
      await importData(text);
      
      setStorageStats(getStorageStats());
      setImportFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    try {
      clearAllData();
      setStorageStats(getStorageStats());
      setShowClearConfirm(false);
      alert('All data cleared successfully!');
    } catch (error) {
      console.error('Clear data failed:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  const refreshStats = () => {
    setStorageStats(getStorageStats());
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Data Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Export, import, and manage your car journal data
        </p>
      </div>

      {/* Storage Statistics */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Storage Statistics
          </h3>
          <button
            onClick={refreshStats}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
        
        {storageStats.available ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Events:</span>
              <span className="text-gray-900 dark:text-gray-100">{storageStats.events}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Vehicle Profile:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {storageStats.hasVehicleProfile ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Storage Used:</span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatBytes(storageStats.used)} / {formatBytes(storageStats.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((storageStats.used / storageStats.total) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            Local storage is not available
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Sale Pack Export Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Vehicle Sale Pack
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Generate a professional HTML report with vehicle details and maintenance history for sales or insurance purposes.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSalePackExport}
              disabled={isExporting || !storageStats.available}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Sale Pack
            </button>
            <button
              onClick={handleSalePackPrint}
              disabled={!storageStats.available}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Sale Pack
            </button>
          </div>
        </div>

        {/* JSON Export Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Backup Data (JSON)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download all your car journal data as a JSON file for backup purposes.
          </p>
          <button
            onClick={handleJSONExport}
            disabled={isExporting || !storageStats.available}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export JSON Backup
              </>
            )}
          </button>
        </div>

        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Import Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a previously exported JSON file to restore your data. This will replace all current data.
          </p>
          
          <div className="space-y-3">
            <div>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/30"
              />
            </div>
            
            {importFile && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleImport}
                  disabled={isImporting || !storageStats.available}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Import Data
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setImportFile(null);
                    const fileInput = document.getElementById('import-file') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clear Data Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-3">
            Clear All Data
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Permanently delete all your car journal data. This action cannot be undone.
          </p>
          
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={!storageStats.available}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Are you sure? This will permanently delete all your events, vehicle profile, and settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Yes, Clear All Data
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}