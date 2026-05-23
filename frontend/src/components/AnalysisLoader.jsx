import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AnalysisLoader({ stage }) {
  // Fallback state transitions if a hard value is not supplied
  const [activeStage, setActiveStage] = useState(stage || 0);

  useEffect(() => {
    if (stage !== undefined) {
      setActiveStage(stage);
    }
  }, [stage]);

  const stages = [
    { title: 'Fetching repository...', desc: 'Reading the public repository file tree and structure via GitHub REST API.' },
    { title: 'Analyzing files...', desc: 'Reviewing file contents concurrently through Groq API Llama 3.3 model.' },
    { title: 'Generating review...', desc: 'Aggregating health scores, compiling audit categories, and saving records.' }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-navy-900 border border-navy-800 rounded-xl max-w-md w-full mx-auto shadow-xl">
      <div className="relative flex items-center justify-center">
        {/* Elegant spinner */}
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-slate-100 transition-all duration-300">
          {stages[activeStage]?.title || 'Analyzing Repository...'}
        </h3>
        <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
          {stages[activeStage]?.desc || 'Please wait while we perform full code auditing.'}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="mt-8 flex items-center gap-3 w-full px-4">
        {stages.map((_, idx) => (
          <div 
            key={idx} 
            className="flex-grow h-1.5 rounded-full overflow-hidden bg-navy-800"
          >
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                idx < activeStage 
                  ? 'bg-blue-600' 
                  : idx === activeStage 
                    ? 'bg-blue-500 animate-pulse w-1/2' 
                    : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500 font-mono">
        Step {activeStage + 1} of 3
      </div>
    </div>
  );
}
