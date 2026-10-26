import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ApiKeyBanner } from './components/common/ApiKeyBanner';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { PlannerPage } from './pages/PlannerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AboutSettingsPage } from './pages/AboutSettingsPage';
import { api } from './services/api';
import { HealthInfo } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

  useEffect(() => {
    api.getHealth()
      .then((info) => setHealthInfo(info))
      .catch((err) => console.warn('Could not contact backend health endpoint:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100">
      {/* Optional Demo Mode Banner */}
      <ApiKeyBanner
        isConfigured={Boolean(healthInfo?.groq_configured)}
        onNavigateToSetup={() => setActiveTab('about')}
      />

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'landing' && (
          <LandingPage
            onStartLearning={() => setActiveTab('dashboard')}
            onExploreAssistant={() => setActiveTab('assistant')}
            onNavigateTab={setActiveTab}
          />
        )}
        {activeTab === 'dashboard' && <DashboardPage onNavigateTab={setActiveTab} />}
        {activeTab === 'assistant' && <AssistantPage />}
        {activeTab === 'documents' && <DocumentsPage />}
        {activeTab === 'summarizer' && <SummarizerPage />}
        {activeTab === 'quiz' && <QuizPage />}
        {activeTab === 'flashcards' && <FlashcardsPage />}
        {activeTab === 'planner' && <PlannerPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'about' && <AboutSettingsPage healthInfo={healthInfo} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
