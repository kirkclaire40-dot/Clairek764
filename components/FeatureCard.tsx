import React from 'react';
import type { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
  onSelect: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg border border-slate-200/50 transition-all duration-300 p-6 flex flex-col items-center text-center transform hover:-translate-y-1 w-full h-full"
    >
      <div className="bg-teal-100 text-teal-700 rounded-full p-4 mb-4">
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
    </button>
  );
};