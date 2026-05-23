import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import AnalysisLoader from './components/AnalysisLoader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [recentReviews, setRecentReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);

  // Loading & stage tracking states
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditStage, setAuditStage] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);
  
  const [error, setError] = useState('');

  // Fetch reviews history
  const fetchReviewsList = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`);
      if (response.ok) {
        const data = await response.json();
        setRecentReviews(data);
      }
    } catch (err) {
      console.error('Failed to load past reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviewsList();
  }, []);

  // Sync reviews listing whenever page navigations shift
  useEffect(() => {
    if (activePage === 'home' || activePage === 'history') {
      fetchReviewsList();
    }
  }, [activePage]);

  const handleStartReview = async (repoUrl) => {
    setAuditLoading(true);
    setAuditStage(0);
    setError('');

    // Stage updates simulations
    const fetchStageTimer = setTimeout(() => setAuditStage(1), 2200);
    const analyzeStageTimer = setTimeout(() => setAuditStage(2), 6500);

    try {
      const response = await fetch(`${API_BASE_URL}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      clearTimeout(fetchStageTimer);
      clearTimeout(analyzeStageTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'An error occurred during repository analysis.');
      }

      const reviewData = await response.json();
      setCurrentReview(reviewData);
      setActivePage('dashboard');
      await fetchReviewsList();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Could not communicate with the backend auditor. Please check if the FastAPI server is running.');
      setActivePage('home');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSelectReview = async (reviewId) => {
    setAuditLoading(true);
    setAuditStage(0);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve the selected code review analysis.');
      }
      const data = await response.json();
      setCurrentReview(data);
      setActivePage('dashboard');
    } catch (err) {
      console.error('Select review error:', err);
      setError(err.message);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleExportPdf = async (reviewId) => {
    if (!reviewId) return;
    setExportLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}/export`);
      if (!response.ok) {
        throw new Error('Could not download report PDF. Please try again.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const cleanName = currentReview?.repo_name?.replace('/', '_') || 'Review';
      a.download = `CodeLens_${cleanName}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Export error:', err);
      alert(err.message || 'Error occurred while exporting PDF.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage}
    >
      {auditLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <AnalysisLoader stage={auditStage} />
        </div>
      ) : (
        <>
          {activePage === 'home' && (
            <Home 
              onStartReview={handleStartReview} 
              recentReviews={recentReviews.slice(0, 6)}
              onSelectReview={handleSelectReview}
              error={error}
              setError={setError}
            />
          )}
          {activePage === 'dashboard' && (
            <Dashboard 
              review={currentReview} 
              onExportPdf={handleExportPdf}
              exportLoading={exportLoading}
            />
          )}
          {activePage === 'history' && (
            <History 
              reviews={recentReviews} 
              onSelectReview={handleSelectReview}
            />
          )}
        </>
      )}
    </Layout>
  );
}
