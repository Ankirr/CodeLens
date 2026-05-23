import React from 'react';
import { Eye, Calendar, FileText, ArrowRight, Clock, HelpCircle } from 'lucide-react';

export default function History({ reviews, onSelectReview }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-navy-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Audit History</h1>
          <p className="text-xs text-slate-400 mt-1">Review and re-open all past repository code quality analyses.</p>
        </div>
        <span className="text-xs font-mono font-bold bg-navy-900 border border-navy-800 px-3 py-1 rounded-lg text-slate-400">
          {reviews.length} record{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-navy-900 border border-dashed border-navy-800 rounded-xl max-w-xl mx-auto space-y-4 shadow-md">
          <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">No Past Audits Found</h2>
          <p className="text-sm text-slate-400">
            You haven't run any repository scans yet. Paste a URL on the Home screen to launch your first code review!
          </p>
        </div>
      ) : (
        /* History Table Container */
        <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-navy-800 bg-navy-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-4 px-6">Repository</th>
                  <th className="py-4 px-6">URL</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Files</th>
                  <th className="py-4 px-6">Audit Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs text-slate-300">
                {reviews.map((review) => (
                  <tr 
                    key={review.id}
                    className="hover:bg-navy-800/20 transition-colors group"
                  >
                    {/* Repo Name */}
                    <td className="py-4 px-6 font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {review.repo_name}
                    </td>
                    
                    {/* Repo URL */}
                    <td className="py-4 px-6 max-w-xs truncate text-slate-400">
                      {review.repo_url}
                    </td>
                    
                    {/* Overall Score */}
                    <td className="py-4 px-6 text-center font-mono">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        (review.overall_score || 0) >= 80 
                          ? 'bg-low/10 text-emerald-300 border-low/20' 
                          : (review.overall_score || 0) >= 50 
                            ? 'bg-medium/10 text-orange-300 border-medium/20' 
                            : 'bg-high/10 text-red-300 border-high/20'
                      }`}>
                        {review.overall_score || 100}%
                      </span>
                    </td>
                    
                    {/* Files Reviewed count */}
                    <td className="py-4 px-6 text-center font-mono text-slate-400">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{review.files_reviewed}</span>
                      </div>
                    </td>
                    
                    {/* Created Date */}
                    <td className="py-4 px-6 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </td>
                    
                    {/* Actions button */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelectReview(review.id)}
                        className="inline-flex items-center gap-1 bg-navy-800 hover:bg-blue-600/10 border border-navy-700 hover:border-blue-500/30 hover:text-blue-400 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
