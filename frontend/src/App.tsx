import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    api.getHealth()
      .then((info) => setHealthInfo(info))
      .catch((err) => console.warn('Could not contact backend health endpoint:', err));
  }, []);

  const handleExploreTopic = (topicName: string) => {
    setSelectedTopic(topicName);
    setActiveTab('assistant');
  };

  const isWorkspace = activeTab !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] text-[#18181B] font-ui antialiased selection:bg-[#C25E34]/15 selection:text-[#18181B]">
      {/* Optional Demo Mode Banner */}
      <ApiKeyBanner
        isConfigured={Boolean(healthInfo?.groq_configured)}
        onNavigateToSetup={() => setActiveTab('about')}
      />

      {isWorkspace ? (
        <div className="flex-1 flex min-h-screen">
          {/* Functional Compact Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            healthInfo={healthInfo}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
          />

          {/* Central Workspace Canvas */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              healthInfo={healthInfo}
              onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'dashboard' && <DashboardPage onNavigateTab={setActiveTab} />}
              {activeTab === 'assistant' && (
                <AssistantPage
                  initialQuery={selectedTopic ? `Explain the core concepts and importance of ${selectedTopic}` : undefined}
                  onClearInitialQuery={() => setSelectedTopic(null)}
                />
              )}
              {activeTab === 'documents' && <DocumentsPage />}
              {activeTab === 'summarizer' && <SummarizerPage />}
              {activeTab === 'quiz' && <QuizPage />}
              {activeTab === 'flashcards' && <FlashcardsPage />}
              {activeTab === 'planner' && <PlannerPage />}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'about' && <AboutSettingsPage healthInfo={healthInfo} />}
            </main>

            <Footer />
          </div>
        </div>
      ) : (
        /* Full Product Editorial Story / Landing Page */
        <div className="flex-1 flex flex-col">
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            healthInfo={healthInfo}
            onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          />

          <main className="flex-1 w-full">
            <LandingPage
              onStartLearning={() => setActiveTab('dashboard')}
              onExploreAssistant={() => setActiveTab('assistant')}
              onNavigateTab={setActiveTab}
              onSelectConcept={handleExploreTopic}
            />
          </main>

          <Footer />
        </div>
      )}
    </div>
  );
};

export default App;
