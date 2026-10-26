import {
  HealthInfo,
  ChatMessage,
  DocumentInfo,
  SummaryData,
  QuizData,
  QuizAttemptResult,
  QuizHistoryRecord,
  FlashcardDeck,
  StudyPlanData,
  ProgressAnalytics,
  CitationItem,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // System & Health
  async getHealth(): Promise<HealthInfo> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthInfo>(res);
  },

  async getMetadata(): Promise<any> {
    const res = await fetch(`${API_BASE}/metadata`);
    return handleResponse<any>(res);
  },

  // AI Assistant & Chat
  async sendChatMessage(params: {
    message: string;
    study_mode?: string;
    session_id?: string;
    document_id?: number;
    use_agent_tools?: boolean;
  }): Promise<{
    session_id: string;
    response: string;
    study_mode: string;
    tool_invocations: any[];
    citations: CitationItem[];
    created_at: string;
  }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: params.message,
        study_mode: params.study_mode || 'explain_simply',
        session_id: params.session_id,
        document_id: params.document_id,
        use_agent_tools: params.use_agent_tools !== false,
      }),
    });
    return handleResponse(res);
  },

  async listChatSessions(): Promise<{ session_id: string; title: string; study_mode: string; created_at: string }[]> {
    const res = await fetch(`${API_BASE}/chat/sessions`);
    return handleResponse(res);
  },

  async getSessionHistory(sessionId: string): Promise<{
    session_id: string;
    title: string;
    study_mode: string;
    messages: ChatMessage[];
  }> {
    const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`);
    return handleResponse(res);
  },

  // Document Management
  async uploadDocument(file: File): Promise<DocumentInfo> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<DocumentInfo>(res);
  },

  async listDocuments(): Promise<{ documents: DocumentInfo[]; total_count: number }> {
    const res = await fetch(`${API_BASE}/documents`);
    return handleResponse(res);
  },

  async deleteDocument(documentId: number): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/documents/${documentId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async searchPassages(query: string, topK: number = 4, documentId?: number): Promise<{ query: string; results: CitationItem[] }> {
    const res = await fetch(`${API_BASE}/documents/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        top_k: topK,
        document_id: documentId,
      }),
    });
    return handleResponse(res);
  },

  // Summaries
  async generateSummary(params: {
    document_id?: number;
    text?: string;
    summary_type?: string;
  }): Promise<SummaryData> {
    const res = await fetch(`${API_BASE}/summaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<SummaryData>(res);
  },

  // Quizzes
  async generateQuiz(params: {
    topic: string;
    document_id?: number;
    difficulty?: string;
    question_count?: number;
  }): Promise<QuizData> {
    const res = await fetch(`${API_BASE}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<QuizData>(res);
  },

  async getQuiz(quizId: number): Promise<QuizData> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}`);
    return handleResponse<QuizData>(res);
  },

  async submitQuiz(quizId: number, answers: Record<string, string>): Promise<QuizAttemptResult> {
    const res = await fetch(`${API_BASE}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quiz_id: quizId,
        answers,
      }),
    });
    return handleResponse<QuizAttemptResult>(res);
  },

  async getQuizHistory(): Promise<QuizHistoryRecord[]> {
    const res = await fetch(`${API_BASE}/quizzes/history/all`);
    return handleResponse<QuizHistoryRecord[]>(res);
  },

  // Flashcards
  async generateFlashcards(params: {
    topic: string;
    document_id?: number;
    card_count?: number;
  }): Promise<FlashcardDeck> {
    const res = await fetch(`${API_BASE}/flashcards/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<FlashcardDeck>(res);
  },

  async listFlashcardDecks(): Promise<{ id: number; title: string; topic: string; card_count: number }[]> {
    const res = await fetch(`${API_BASE}/flashcards/decks`);
    return handleResponse(res);
  },

  async getFlashcardDeck(deckId: number): Promise<FlashcardDeck> {
    const res = await fetch(`${API_BASE}/flashcards/decks/${deckId}`);
    return handleResponse<FlashcardDeck>(res);
  },

  async updateFlashcardStatus(deckId: number, cardId: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/flashcards/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deck_id: deckId,
        card_id: cardId,
        status,
      }),
    });
    return handleResponse(res);
  },

  // Study Planner
  async generateStudyPlan(params: {
    target_exam: string;
    exam_date: string;
    available_hours_per_day: number;
    subjects: { name: string; priority: string; difficulty: string }[];
  }): Promise<StudyPlanData> {
    const res = await fetch(`${API_BASE}/planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse<StudyPlanData>(res);
  },

  async getActiveStudyPlan(): Promise<StudyPlanData> {
    const res = await fetch(`${API_BASE}/planner/active`);
    return handleResponse<StudyPlanData>(res);
  },

  async toggleStudyBlock(planId: number, blockId: string, completed: boolean): Promise<StudyPlanData> {
    const res = await fetch(`${API_BASE}/planner/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: planId,
        block_id: blockId,
        completed,
      }),
    });
    return handleResponse<StudyPlanData>(res);
  },

  // Analytics
  async getAnalytics(): Promise<ProgressAnalytics> {
    const res = await fetch(`${API_BASE}/analytics`);
    return handleResponse<ProgressAnalytics>(res);
  },
};
