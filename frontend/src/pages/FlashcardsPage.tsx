import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  Check,
  AlertCircle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { FlashcardDeck, Flashcard, DocumentInfo } from '../types';

export const FlashcardsPage: React.FC = () => {
  const [topic, setTopic] = useState('Computer Systems');
  const [cardCount, setCardCount] = useState(6);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Decks & Active state
  const [savedDecks, setSavedDecks] = useState<{ id: number; title: string; topic: string; card_count: number }[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [filterNeedsRevision, setFilterNeedsRevision] = useState(false);

  useEffect(() => {
    api.listDocuments().then((res) => setDocuments(res.documents)).catch(console.error);
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const decks = await api.listFlashcardDecks();
      setSavedDecks(decks);
      if (decks.length > 0 && !activeDeck) {
        const fullDeck = await api.getFlashcardDeck(decks[0].id);
        setActiveDeck(fullDeck);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const deck = await api.generateFlashcards({
        topic,
        card_count: cardCount,
        document_id: selectedDocId,
      });
      setActiveDeck(deck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      loadDecks();
    } catch (err: any) {
      alert(`Flashcard generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectDeck = async (deckId: number) => {
    try {
      const fullDeck = await api.getFlashcardDeck(deckId);
      setActiveDeck(fullDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setShowHint(false);
      setFilterNeedsRevision(false);
    } catch (err: any) {
      alert(`Failed to load deck: ${err.message}`);
    }
  };

  const handleCardStatus = async (status: 'known' | 'needs_revision') => {
    if (!activeDeck) return;
    const currentCard = activeCards[currentCardIndex];
    if (!currentCard) return;

    try {
      await api.updateFlashcardStatus(activeDeck.id, currentCard.id, status);
      // Update local state
      const updatedCards = activeDeck.cards.map((c) =>
        c.id === currentCard.id ? { ...c, status } : c
      );
      const knownCount = updatedCards.filter((c) => c.status === 'known').length;
      const revisionCount = updatedCards.filter((c) => c.status === 'needs_revision').length;

      setActiveDeck({
        ...activeDeck,
        cards: updatedCards,
        known_count: knownCount,
        revision_count: revisionCount,
      });

      // Advance to next card
      handleNext();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  };

  const handleShuffle = () => {
    if (!activeDeck) return;
    const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
    setActiveDeck({ ...activeDeck, cards: shuffled });
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const activeCards = activeDeck
    ? filterNeedsRevision
      ? activeDeck.cards.filter((c) => c.status === 'needs_revision')
      : activeDeck.cards
    : [];

  const currentCard = activeCards[currentCardIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-amber-400" />
            <span>Interactive Spaced Flashcards</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Double-sided 3D flip cards, recall hints, and targeted revision of difficult concepts.
          </p>
        </div>

        {/* Deck Picker Dropdown */}
        {savedDecks.length > 0 && (
          <select
            value={activeDeck?.id || ''}
            onChange={(e) => handleSelectDeck(Number(e.target.value))}
            className="text-xs bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            {savedDecks.map((d) => (
              <option key={d.id} value={d.id}>
                🎴 {d.title} ({d.card_count} cards)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. FLASHCARD CREATOR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <form onSubmit={handleGenerateDeck} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic for flashcard deck (e.g. Cache Coherence, OSI Model, B-Trees)..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />

          {documents.length > 0 && (
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">No document constraint</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  📄 {d.original_name.slice(0, 20)}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate New Deck'}</span>
          </button>
        </form>
      </div>

      {/* 3. ACTIVE DECK VIEWER */}
      {activeDeck && activeCards.length > 0 ? (
        <div className="space-y-6">
          {/* Deck Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white text-sm font-['Outfit']">{activeDeck.title}</span>
              <div className="text-[11px] text-slate-400">
                Card {currentCardIndex + 1} of {activeCards.length}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mastery Counters */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  {activeDeck.known_count} Known
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                  {activeDeck.revision_count} Revision
                </span>
              </div>

              {/* Filter Difficult Toggle */}
              <button
                onClick={() => {
                  setFilterNeedsRevision(!filterNeedsRevision);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                  filterNeedsRevision
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                }`}
                title="Filter difficult cards only"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Difficult Only</span>
              </button>

              <button
                onClick={handleShuffle}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
                title="Shuffle deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Interactive Flip Card */}
          <div className="perspective-1000 w-full max-w-2xl mx-auto h-[320px] sm:h-[360px]">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full h-full relative cursor-pointer transform-style-3d transition-transform duration-500 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* CARD FRONT */}
              <div className="absolute inset-0 backface-hidden glass-panel-glow p-8 rounded-3xl border border-cyan-500/30 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-mono text-[10px]">
                    FRONT (PROMPT)
                  </span>
                  <span className="text-[11px]">Click to flip ↷</span>
                </div>

                <div className="text-center space-y-4 my-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] leading-relaxed">
                    {currentCard?.front}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  {currentCard?.hint ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                    >
                      {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showHint ? `Hint: ${currentCard.hint}` : 'Show Memory Hint'}</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="text-[10px] font-mono text-slate-500">
                    Status: {currentCard?.status}
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel p-8 rounded-3xl border border-violet-500/30 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-slate-900 via-[#101426] to-slate-900">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-violet-950/80 text-violet-400 border border-violet-500/30 font-mono text-[10px]">
                    BACK (EXPLANATION)
                  </span>
                  <span className="text-[11px]">Click to flip ↶</span>
                </div>

                <div className="text-center space-y-4 my-auto">
                  <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                    {currentCard?.back}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-500">
                  Select mastery status below to update spaced recall
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Mastery Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto pt-2">
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCardStatus('needs_revision')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-sm transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Needs Revision</span>
              </button>

              <button
                onClick={() => handleCardStatus('known')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Mastered</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-white/10"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-['Outfit']">No Flashcards in Deck</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterNeedsRevision
              ? 'No cards currently marked as needing revision! Turn off "Difficult Only" to view all cards.'
              : 'Generate a deck using the input bar above to begin active recall practice.'}
          </p>
        </div>
      )}
    </div>
  );
};
