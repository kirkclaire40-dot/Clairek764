
import type React from 'react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  component: React.ComponentType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  gratitude1: string;
  gratitude2: string;
  gratitude3: string;
  answeredPrayers: string;
}

export interface Settings {
  remindersEnabled: boolean;
  reminderTime: string; // HH:MM
}
