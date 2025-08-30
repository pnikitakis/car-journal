'use client';

import { useState } from 'react';
import { useSettings } from '../lib/use-settings';
import { type EventKind } from '../types/settings';

const EVENT_TYPE_LABELS: Record<EventKind, string> = {
  fuel: 'Fuel',
  service: 'Service',
  tires: 'Tires',
  damage: 'Damage',
  obd: 'OBD',
  custom: 'Custom',
};

const EVENT_TYPE_DESCRIPTIONS: Record<EventKind, string> = {
  fuel: 'Track fuel purchases and consumption',
  service: 'Record maintenance and repairs',
  tires: 'Log tire changes and rotations',
  damage: 'Document accidents and damage',
  obd: 'Store OBD diagnostic data',
  custom: 'Create custom event types',
};

export function SettingsPage() {
  const {
    settings,
    isLoading,
    error,
    toggleEventType,
    addTag,
    removeTag,
    editTag,
  } = useSettings();

  const [newTagInput, setNewTagInput] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagInput, setEditTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;

    try {
      await addTag(newTagInput);
      setNewTagInput('');
      setTagError(null);
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed to add tag');
    }
  };

  const handleEditTag = async (oldTag: string) => {
    if (!editTagInput.trim()) {
      setEditingTag(null);
      return;
    }

    try {
      await editTag(oldTag, editTagInput);
      setEditingTag(null);
      setEditTagInput('');
      setTagError(null);
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed to edit tag');
    }
  };

  const startEditingTag = (tag: string) => {
    setEditingTag(tag);
    setEditTagInput(tag);
    setTagError(null);
  };

  const cancelEditingTag = () => {
    setEditingTag(null);
    setEditTagInput('');
    setTagError(null);
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(tag);
      setTagError(null);
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed to remove tag');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading settings</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-gray-600 dark:text-gray-400">No settings available</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your Car Journal experience
        </p>
      </div>

      {/* Event Types Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Event Types
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose which event types to show in the add event wizard and filters.
        </p>
        
        <div className="space-y-3">
          {(Object.keys(EVENT_TYPE_LABELS) as EventKind[]).map((eventType) => (
            <div
              key={eventType}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor={`toggle-${eventType}`}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      id={`toggle-${eventType}`}
                      type="checkbox"
                      checked={settings.enabledEventTypes.includes(eventType)}
                      onChange={() => toggleEventType(eventType)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {EVENT_TYPE_LABELS[eventType]}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  {EVENT_TYPE_DESCRIPTIONS[eventType]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tags Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Saved Tags
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage your saved tags for quick event tagging.
        </p>

        {/* Add new tag */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add new tag..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
            >
              Add
            </button>
          </div>
          {tagError && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{tagError}</p>
          )}
        </div>

        {/* Tags list */}
        {settings.tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No saved tags yet.</p>
            <p className="text-sm">Add tags above to quickly categorize your events.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {settings.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {editingTag === tag ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editTagInput}
                      onChange={(e) => setEditTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEditTag(tag);
                        } else if (e.key === 'Escape') {
                          cancelEditingTag();
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEditingTag}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {tag}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditingTag(tag)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                        title="Edit tag"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        title="Remove tag"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}