import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SETTINGS_KEY = 'appSettings';
const DEFAULT_SETTINGS: Settings = {
  remindersEnabled: false,
  reminderTime: '09:00',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isOpen) {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage", error);
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, [isOpen]);

  const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    
    if (isEnabled && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("You've disabled notifications. To enable them, please update your browser settings for this site.");
        setSettings(prev => ({ ...prev, remindersEnabled: false }));
        return;
      }
    }
    
    setSettings(prev => ({ ...prev, remindersEnabled: isEnabled }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, reminderTime: e.target.value }));
  };
  
  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    onClose();
    alert('Settings saved!');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200">
            <CloseIcon />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Daily Reminders</h3>
            <p className="text-sm text-slate-500 mb-3">Get a notification to engage with the app each day.</p>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <label htmlFor="reminderToggle" className="font-medium text-slate-800">Enable Daily Reminder</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="reminderToggle"
                  className="sr-only peer"
                  checked={settings.remindersEnabled}
                  onChange={handleToggleChange}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>

          {settings.remindersEnabled && (
            <div className="border-t pt-4">
              <label htmlFor="reminderTime" className="block font-medium text-slate-800 mb-2">Reminder Time</label>
              <input
                type="time"
                id="reminderTime"
                value={settings.reminderTime}
                onChange={handleTimeChange}
                className="w-full p-2 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm hover:shadow-md"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-teal-700 transition-colors duration-300 shadow hover:shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};