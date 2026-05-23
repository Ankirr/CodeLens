import React, { useState } from 'react';
import { 
  Download, FileCode, CheckCircle, Bug, ShieldAlert, 
  ChevronDown, ChevronRight, Zap, Lightbulb, HelpCircle, 
  Terminal, Sparkles
} from 'lucide-react';
import IssueBadge from '../components/IssueBadge';

export default function Dashboard({ review, onExportPdf, exportLoading }) {
  const files = review?.review_data?.files || [];
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [openSections, setOpenSections] = useState({
    bugs: true,
    performance: true,
    security: true,
    bestPractices: true,
    refactor: true,
    highlights: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!review || files.length === 0) {
    return (
      <div className="text-center py-16 bg-navy-900 border border-navy-800 rounded-xl max-w-xl mx-auto space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">No Review Loaded</h2>
        <p className="text-sm text-slate-400">
          Go back to the Home screen and enter a public GitHub repository URL to initiate an audit.
        </p>
      </div>
    );
  }

  const selectedFile = files[selectedFileIndex] || files[0];

  // Helper count of issues in selected file
  const totalIssuesCount = 
    (selectedFile.bugs?.length || 0) + 
    (selectedFile.performance?.length || 0) + 
    (selectedFile.security?.length || 0) + 
    (selectedFile.best_practices?.length || 0);

  return (
    <div className="space-y-6">
      {/* Dashboard Metadata Header */}
      <section className="bg-navy-900 border border-navy-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 truncate">
              {review.repo_name}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-400 font-mono">
              public
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate leading-relaxed">
            {review.repo_url}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-navy-800/60">
          {/* Key Metrics block */}
          <div className="flex items-center gap-5 font-mono text-center">
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Score</div>
              <div className={`text-xl font-bold ${
                (review.overall_score || 0) >= 80 
                  ? 'text-low' 
                  : (review.overall_score || 0) >= 50 
                    ? 'text-medium' 
                    : 'text-high'
              }`}>
                {review.overall_score || 100}%
              </div>
            </div>
            <div className="h-8 w-px bg-navy-800" />
            <div className="space-y-0.5">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Audited</div>
              <div className="text-xl font-bold text-slate-200">
                {review.files_reviewed} file{review.files_reviewed !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <button
            onClick={() => onExportPdf(review.id)}
            disabled={exportLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow shadow-blue-900/10 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportLoading ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </section>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Reviewed File Tabs */}
        <aside className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-xl p-4 space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 border-b border-navy-800/80">
            Files Scanned
          </h3>
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-3 text-xs font-medium transition-all ${
                  selectedFileIndex === idx
                    ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-950 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${selectedFileIndex === idx ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.filename}</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  (file.overall_score || 0) >= 80 
                    ? 'bg-low/10 text-emerald-300' 
                    : (file.overall_score || 0) >= 50 
                      ? 'bg-medium/10 text-orange-300' 
                      : 'bg-high/10 text-red-300'
                }`}>
                  {file.overall_score || 100}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Side: Detailed Collapsible Categories */}
        <section className="lg:col-span-3 space-y-4">
          {/* Active File Summary */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl p-6 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-50 truncate">
                {selectedFile.filename}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {totalIssuesCount} issue{totalIssuesCount !== 1 ? 's' : ''} found
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              &ldquo;{selectedFile.summary}&rdquo;
            </p>
          </div>

          {/* 1. BUGS SECTION */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('bugs')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 text-red-400 shrink-0">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Bugs &amp; Correctness</h3>
                  <p className="text-xs text-slate-500">Critical coding bugs, type errors, or potential crash scenarios.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-red-400">
                  {selectedFile.bugs?.length || 0}
                </span>
                {openSections.bugs ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.bugs && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-4">
                {(selectedFile.bugs || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No critical bugs detected in this file!</p>
                ) : (
                  <div className="space-y-4">
                    {selectedFile.bugs.map((item, idx) => (
                      <div key={idx} className="bg-navy-950/40 border border-navy-800/60 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <IssueBadge severity={item.severity} />
                            {item.line && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-navy-800 text-slate-400">
                                Line {item.line}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Issue:</span> {item.issue}
                        </p>
                        <div className="bg-navy-950/80 rounded border border-navy-800/80 p-3 mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 font-bold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Actionable Fix</span>
                          </div>
                          <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap code-preview">
                            {item.fix}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. PERFORMANCE SECTION */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('performance')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20 text-orange-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Performance Issues</h3>
                  <p className="text-xs text-slate-500">Unnecessary allocations, memory leaks, or inefficient loops.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-orange-400">
                  {selectedFile.performance?.length || 0}
                </span>
                {openSections.performance ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.performance && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-4">
                {(selectedFile.performance || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No performance concerns identified in this file!</p>
                ) : (
                  <div className="space-y-4">
                    {selectedFile.performance.map((item, idx) => (
                      <div key={idx} className="bg-navy-950/40 border border-navy-800/60 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <IssueBadge severity={item.severity} />
                            {item.line && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-navy-800 text-slate-400">
                                Line {item.line}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Bottleneck:</span> {item.issue}
                        </p>
                        <div className="bg-navy-950/80 rounded border border-navy-800/80 p-3 mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 font-bold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Actionable Fix</span>
                          </div>
                          <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap code-preview">
                            {item.fix}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. SECURITY SECTION */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('security')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 text-red-400 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Security Concerns</h3>
                  <p className="text-xs text-slate-500">OWASP exploits, credential exposures, or dangerous dependencies.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-red-400">
                  {selectedFile.security?.length || 0}
                </span>
                {openSections.security ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.security && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-4">
                {(selectedFile.security || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No security vulnerabilities detected in this file!</p>
                ) : (
                  <div className="space-y-4">
                    {selectedFile.security.map((item, idx) => (
                      <div key={idx} className="bg-navy-950/40 border border-navy-800/60 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <IssueBadge severity={item.severity} />
                            {item.line && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-navy-800 text-slate-400">
                                Line {item.line}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Threat:</span> {item.issue}
                        </p>
                        <div className="bg-navy-950/80 rounded border border-navy-800/80 p-3 mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 font-bold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Actionable Fix</span>
                          </div>
                          <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap code-preview">
                            {item.fix}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. BEST PRACTICES SECTION */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('bestPractices')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 text-blue-400 shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Best Practices</h3>
                  <p className="text-xs text-slate-500">Formatting violations, documentation, and industry standards.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-blue-400">
                  {selectedFile.best_practices?.length || 0}
                </span>
                {openSections.bestPractices ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.bestPractices && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-4">
                {(selectedFile.best_practices || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No best practice concerns identified in this file!</p>
                ) : (
                  <div className="space-y-4">
                    {selectedFile.best_practices.map((item, idx) => (
                      <div key={idx} className="bg-navy-950/40 border border-navy-800/60 rounded-lg p-4 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <IssueBadge severity={item.severity} />
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-slate-200">Violation:</span> {item.issue}
                        </p>
                        <div className="bg-navy-950/80 rounded border border-navy-800/80 p-3 mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500 font-bold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Actionable Fix</span>
                          </div>
                          <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap code-preview">
                            {item.fix}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. REFACTOR & OPTIMIZATIONS */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('refactor')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 text-blue-400 shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Refactoring Suggestions</h3>
                  <p className="text-xs text-slate-500">Readability improvements and modularity enhancements.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-blue-400">
                  {selectedFile.refactor_suggestions?.length || 0}
                </span>
                {openSections.refactor ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.refactor && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-3">
                {(selectedFile.refactor_suggestions || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-1">No refactoring suggestions available.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedFile.refactor_suggestions.map((item, idx) => (
                      <div key={idx} className="bg-navy-950/40 border border-navy-800/60 rounded-lg p-4 space-y-2">
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold text-slate-200">Opportunity:</span> {item.issue}
                        </p>
                        <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap bg-navy-950/85 p-3 rounded border border-navy-800/80 mt-1">
                          {item.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 6. POSITIVE HIGHLIGHTS */}
          <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('highlights')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-navy-800/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Positive Highlights</h3>
                  <p className="text-xs text-slate-500">Good architectural designs and optimized routines recognized by the AI.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-navy-800 px-2.5 py-0.5 rounded text-emerald-400">
                  {selectedFile.positive_highlights?.length || 0}
                </span>
                {openSections.highlights ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {openSections.highlights && (
              <div className="border-t border-navy-800/80 px-6 py-4 space-y-2.5">
                {(selectedFile.positive_highlights || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-1">No highlights documented.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {selectedFile.positive_highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-navy-950/30 p-3 rounded-lg border border-navy-800/40">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
