import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '../../types';

const today = new Date().toISOString().split('T')[0];

export const GratitudeJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>({
    date: today,
    gratitude1: '',
    gratitude2: '',
    gratitude3: '',
    answeredPrayers: '',
  });

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('gratitudeJournalEntries');
      if (savedEntries) {
        const parsedEntries: JournalEntry[] = JSON.parse(savedEntries);
        setEntries(parsedEntries);
        const todaysEntry = parsedEntries.find(entry => entry.date === today);
        if (todaysEntry) {
          setCurrentEntry(todaysEntry);
        }
      }
    } catch (error) {
      console.error("Failed to load journal entries from localStorage", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const otherEntries = entries.filter(entry => entry.date !== today);
    const updatedEntries = [...otherEntries, currentEntry];
    // sort entries by date descending
    updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEntries(updatedEntries);
    localStorage.setItem('gratitudeJournalEntries', JSON.stringify(updatedEntries));
    alert('Journal entry saved!');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">My Gratitude Journal</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">Take a moment to reflect on God's goodness and answered prayers.</p>

      <div className="bg-rose-50 border-l-4 border-rose-400 p-6 rounded-r-lg mb-6">
        <h3 className="text-xl font-semibold mb-3 text-rose-800">Today's Entry - {new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="gratitude1" className="block text-sm font-medium text-slate-700">1. I'm thankful for...</label>
            <input type="text" name="gratitude1" value={currentEntry.gratitude1} onChange={handleInputChange} placeholder="A specific promise you saw fulfilled..." className="mt-1 block w-full p-2 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"/>
          </div>
          <div>
            <label htmlFor="gratitude2" className="block text-sm font-medium text-slate-700">2. I'm thankful for...</label>
            <input type="text" name="gratitude2" value={currentEntry.gratitude2} onChange={handleInputChange} placeholder="A moment of peace or provision..." className="mt-1 block w-full p-2 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"/>
          </div>
          <div>
            <label htmlFor="gratitude3" className="block text-sm font-medium text-slate-700">3. I'm thankful for...</label>
            <input type="text" name="gratitude3" value={currentEntry.gratitude3} onChange={handleInputChange} placeholder="A person or blessing in your life..." className="mt-1 block w-full p-2 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"/>
          </div>
          <div>
            <label htmlFor="answeredPrayers" className="block text-sm font-medium text-slate-700">Answered Prayers</label>
            <textarea name="answeredPrayers" value={currentEntry.answeredPrayers} onChange={handleInputChange} rows={4} placeholder="Record any prayers that have been answered..." className="mt-1 block w-full p-2 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-500 transition-shadow shadow-sm hover:shadow-md"></textarea>
          </div>
        </div>
        <button onClick={handleSave} className="mt-6 bg-teal-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-teal-700 transition-colors duration-300 shadow hover:shadow-md">
          Save Entry
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Past Entries</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {entries.length > 0 ? (
            entries.filter(e => e.date !== today).map(entry => (
              <details key={entry.date} className="bg-slate-50 p-4 rounded-lg shadow-sm">
                <summary className="font-semibold cursor-pointer">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</summary>
                <div className="mt-3 text-slate-700 space-y-2">
                  <p><strong>Thankful for:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {entry.gratitude1 && <li>{entry.gratitude1}</li>}
                    {entry.gratitude2 && <li>{entry.gratitude2}</li>}
                    {entry.gratitude3 && <li>{entry.gratitude3}</li>}
                  </ul>
                  {entry.answeredPrayers && (
                    <div>
                      <p className="mt-2"><strong>Answered Prayers:</strong></p>
                      <p className="whitespace-pre-wrap">{entry.answeredPrayers}</p>
                    </div>
                  )}
                </div>
              </details>
            ))
          ) : (
            <p className="text-slate-500">No past entries yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};