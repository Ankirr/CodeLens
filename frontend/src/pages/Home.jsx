import React, { useState, useEffect } from 'react';
import { Play, AlertCircle, FileText, Calendar, ShieldCheck, Zap } from 'lucide-react';

export default function Home({ onStartReview, recentReviews, onSelectReview, error, setError }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [localError, setLocalError] = useState('');

  const handleStartReview = (e) => {
    e.preventDefault();
    setLocalError('');
    setError('');

    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) {
      setLocalError('Please enter a GitHub repository URL.');
      return;
    }

    // RegEx validation for owner/repo
    const regex = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)/i;
    const match = trimmedUrl.match(regex);
    if (!match) {
      setLocalError("Must be a valid public GitHub repository URL, e.g., 'https://github.com/user/repo'");
      return;
    }

    // Pass validated URL to parent controller
    onStartReview(trimmedUrl);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
          Professional <span className="text-blue-500">AI Code Reviews</span> for GitHub Repositories.
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Instantly audit your codebase for critical bugs, security vulnerabilities, performance bottlenecks, and best practices. No account required.
        </p>
      </section>

      {/* URL Input Form */}
      <section className="max-w-2xl mx-auto bg-navy-900 border border-navy-800 rounded-xl p-6 sm:p-8 shadow-lg">
        <form onSubmit={handleStartReview} className="space-y-4">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-semibold text-slate-300 mb-2">
              GitHub Repository URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="repo-url"
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/facebook/react"
                className="flex-grow bg-navy-950 border border-navy-800 hover:border-navy-700 focus:border-blue-500 focus:outline-none rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Audit Repository</span>
              </button>
            </div>
          </div>

          {/* Validation & Server Error Displays */}
          {(localError || error) && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}
        </form>

        {/* Feature Highlights Grid */}
        <div className="mt-8 pt-8 border-t border-navy-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Checks for security flaws and exploits</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Uncovers speed and memory leaks</span>
          </div>
        </div>
      </section>

      {/* Recent Reviews Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <h2 className="text-xl font-bold text-slate-100">Recent Audits</h2>
          <span className="text-xs text-slate-500 font-mono">
            {recentReviews.length} repo{recentReviews.length !== 1 ? 's' : ''} stored
          </span>
        </div>

        {recentReviews.length === 0 ? (
          <div className="text-center py-12 bg-navy-900/30 border border-dashed border-navy-800 rounded-xl text-slate-500 text-sm">
            No audits performed yet. Paste a URL above to start!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                onClick={() => onSelectReview(review.id)}
                className="bg-navy-900 hover:bg-navy-800 border border-navy-800 hover:border-navy-700 rounded-xl p-5 cursor-pointer transition-all hover:scale-[1.01] shadow-sm flex flex-col justify-between h-40 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                      {review.repo_name}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      (review.overall_score || 0) >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : (review.overall_score || 0) >= 50 
                          ? 'bg-orange-500/10 text-orange-400' 
                          : 'bg-red-500/10 text-red-400'
                    }`}>
                      {review.overall_score || 100}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 truncate">
                    {review.repo_url}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-navy-800/60 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{review.files_reviewed} files</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
