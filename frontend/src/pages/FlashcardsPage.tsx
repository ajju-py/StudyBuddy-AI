import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
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
import { FlashcardDeck, DocumentInfo } from '../types';

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

      handleNext();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (activeCards.length > 0) {
      setCurrentCardIndex((prev) => (prev + 1) % activeCards.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (activeCards.length > 0) {
      setCurrentCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
    }
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
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
            <Layers className="w-3.5 h-3.5 text-[#C25E34]" />
            <span className="uppercase tracking-wider">Tactile Spaced Recall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
            Index Card Deck
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Flip cards for active recall, inspect memory hints, and isolate difficult concepts.
          </p>
        </div>

        {/* Deck Picker Dropdown */}
        {savedDecks.length > 0 && (
          <select
            value={activeDeck?.id || ''}
            onChange={(e) => handleSelectDeck(Number(e.target.value))}
            className="text-xs bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3 py-1.5 text-[#18181B] focus:outline-none focus:border-[#C25E34]"
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
      <div className="surface-card p-4 sm:p-5 rounded-xl border border-[#E5E2D9]">
        <form onSubmit={handleGenerateDeck} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic for flashcard deck (e.g., Cache Coherence, OSI Model, B-Trees)..."
            className="flex-1 bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] placeholder-[#8C877D] focus:outline-none focus:border-[#C25E34]"
          />

          {documents.length > 0 && (
            <select
              value={selectedDocId || ''}
              onChange={(e) =>
                setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
            >
              <option value="">All Documents</option>
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
            className="px-4 py-2 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing...' : 'Create Deck'}</span>
          </button>
        </form>
      </div>

      {/* 3. ACTIVE DECK VIEWER */}
      {activeDeck && activeCards.length > 0 ? (
        <div className="space-y-6">
          {/* Deck Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 surface-card p-4 rounded-xl border border-[#E5E2D9] text-xs">
            <div className="space-y-0.5">
              <span className="font-serif-title font-bold text-[#18181B] text-sm">
                {activeDeck.title}
              </span>
              <div className="text-[11px] font-mono text-[#8C877D]">
                Card {currentCardIndex + 1} of {activeCards.length}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Mastery Counters */}
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#EAF3EE] text-[#2D5A43] border border-[#2D5A43]/20 font-semibold">
                  {activeDeck.known_count} Mastered
                </span>
                <span className="px-2 py-0.5 rounded bg-[#FDF2F2] text-[#C25E34] border border-[#C25E34]/20 font-semibold">
                  {activeDeck.revision_count} Review
                </span>
              </div>

              {/* Filter Difficult Toggle */}
              <button
                onClick={() => {
                  setFilterNeedsRevision(!filterNeedsRevision);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
                  filterNeedsRevision
                    ? 'bg-[#18181B] text-[#FAF9F5] border-[#18181B]'
                    : 'bg-[#FAF9F5] text-[#57534E] border-[#E5E2D9] hover:text-[#18181B]'
                }`}
                title="Filter difficult cards only"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Difficult Only</span>
              </button>

              <button
                onClick={handleShuffle}
                className="p-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#EAE7DF] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9]"
                title="Shuffle deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tactile Index Card */}
          <div className="perspective-1000 w-full max-w-2xl mx-auto h-[320px] sm:h-[350px]">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`w-full h-full relative cursor-pointer transform-style-3d transition-transform duration-500 ease-out select-none ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* CARD FRONT */}
              <div className="absolute inset-0 backface-hidden surface-card p-8 rounded-2xl border border-[#E5E2D9] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8C877D]">
                  <span className="px-2 py-0.5 rounded bg-[#F3F1EC] text-[#57534E] font-mono text-[10px] font-semibold border border-[#E5E2D9]">
                    PROMPT
                  </span>
                  <span className="text-[11px] font-mono">Click card to reveal answer ↷</span>
                </div>

                <div className="text-center space-y-4 my-auto px-4">
                  <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#18181B] leading-relaxed">
                    {currentCard?.front}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E2D9]/60">
                  {currentCard?.hint ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(!showHint);
                      }}
                      className="inline-flex items-center gap-1.5 text-[#C25E34] hover:underline font-medium text-[11px]"
                    >
                      {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showHint ? `Hint: ${currentCard.hint}` : 'Inspect Memory Hint'}</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="text-[10px] font-mono uppercase text-[#8C877D]">
                    Status: {currentCard?.status}
                  </div>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#FAF9F5] p-8 rounded-2xl border border-[#D4CFBF] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-[#8C877D]">
                  <span className="px-2 py-0.5 rounded bg-[#EAE7DF] text-[#18181B] font-mono text-[10px] font-semibold border border-[#D4CFBF]">
                    EXPLANATION
                  </span>
                  <span className="text-[11px] font-mono">Click card to return ↶</span>
                </div>

                <div className="text-center space-y-4 my-auto px-4">
                  <p className="text-sm sm:text-base text-[#18181B] font-ui leading-relaxed">
                    {currentCard?.back}
                  </p>
                </div>

                <div className="text-center text-[11px] text-[#8C877D] font-mono border-t border-[#D4CFBF]/60 pt-2">
                  Indicate mastery level below to advance spaced retention
                </div>
              </div>
            </div>
          </div>

          {/* Tactile Mastery Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto pt-2">
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-secondary text-xs font-medium text-[#57534E]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCardStatus('needs_revision')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF9F5] hover:bg-[#FDF2F2] text-[#C25E34] border border-[#C25E34]/30 text-xs font-semibold transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Needs Review</span>
              </button>

              <button
                onClick={() => handleCardStatus('known')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF9F5] hover:bg-[#EAF3EE] text-[#2D5A43] border border-[#2D5A43]/30 text-xs font-semibold transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Mastered</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-secondary text-xs font-medium text-[#57534E]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="surface-card p-12 rounded-xl border border-[#E5E2D9] text-center space-y-3">
          <Layers className="w-8 h-8 text-[#8C877D] mx-auto" />
          <h3 className="text-base font-serif-title font-bold text-[#18181B]">
            No Cards in Current View
          </h3>
          <p className="text-xs text-[#57534E] max-w-md mx-auto">
            {filterNeedsRevision
              ? 'No cards currently flagged for revision! Toggle "Difficult Only" off to inspect all cards.'
              : 'Generate an index card deck above to begin your active recall session.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
