export interface HealthInfo {
  status: string;
  version: string;
  app_name: string;
  groq_configured: boolean;
  masked_key: string;
  active_model: string;
  supported_models: string[];
}

export interface CitationItem {
  document_id: number;
  document_name: string;
  page_number: number;
  chunk_index: number;
  snippet: string;
  relevance_score: number;
}

export interface ToolInvocationRecord {
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  status: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  study_mode: string;
  tool_invocations?: ToolInvocationRecord[];
  citations?: CitationItem[];
  created_at?: string;
}

export interface DocumentInfo {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  page_count: number;
  chunk_count: number;
  created_at: string;
}

export interface KeyConcept {
  concept: string;
  explanation: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface SummaryData {
  summary: string;
  summary_type: string;
  key_concepts: KeyConcept[];
  definitions: DefinitionItem[];
  revision_notes: string[];
  potential_questions: string[];
  source_title: string;
}

export interface QuizQuestionClient {
  id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  points: number;
}

export interface QuizData {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  question_count: number;
  questions: QuizQuestionClient[];
  created_at: string;
}

export interface QuestionFeedback {
  question_id: number;
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  points_awarded: number;
}

export interface QuizAttemptResult {
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  feedback: QuestionFeedback[];
  completed_at: string;
}

export interface QuizHistoryRecord {
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  topic: string;
  difficulty: string;
  score: number;
  max_score: number;
  percentage: number;
  completed_at: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tags?: string[];
  status: 'unseen' | 'known' | 'needs_revision';
}

export interface FlashcardDeck {
  id: number;
  title: string;
  topic: string;
  card_count: number;
  cards: Flashcard[];
  known_count: number;
  revision_count: number;
  created_at: string;
}

export interface StudySubject {
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimated_hours?: number;
}

export interface StudySessionBlock {
  id: string;
  day_number: number;
  date_label: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  activity_type: 'learning' | 'revision' | 'practice_quiz' | 'break';
  completed: boolean;
}

export interface StudyPlanData {
  id: number;
  title: string;
  target_exam: string;
  exam_date: string;
  available_hours_per_day: number;
  subjects: StudySubject[];
  schedule: StudySessionBlock[];
  completion_percentage: number;
  created_at: string;
}

export interface RecentActivity {
  id: number;
  activity_type: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface ProgressAnalytics {
  total_questions_answered: number;
  total_quizzes_completed: number;
  actual_average_quiz_score: number;
  total_flashcards_reviewed: number;
  known_flashcards_count: number;
  revision_flashcards_count: number;
  total_documents_uploaded: number;
  total_study_plans_active: number;
  study_plan_completion_rate: number;
  recent_quiz_scores: {
    id: number;
    title: string;
    percentage: number;
    score: number;
    max_score: number;
    date: string;
  }[];
  recent_activities: RecentActivity[];
}
