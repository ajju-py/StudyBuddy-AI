export interface Author {
  name: string;
  role: string;
  qualification: string;
}

export interface Institution {
  name: string;
  city: string;
  state: string;
  country: string;
  department: string;
}

export interface StudyMode {
  id: 'explain_simply' | 'exam_prep' | 'deep_dive' | 'socratic_tutor' | 'quick_revision';
  name: string;
  description: string;
  badge: string;
  iconName: string;
}

export const PROJECT_METADATA = {
  projectName: "StudyBuddy AI",
  fullTitle: "StudyBuddy AI — Intelligent AI Study Assistant",
  tagline: "Learn Smarter. Understand Deeper. Prepare Better.",
  category: "AI Agent Development — Academic Mini Project",
  version: "1.0.0",
  academicYear: "2026–2027",
  authors: [
    {
      name: "Ajay Tandale",
      role: "Lead AI & Backend Architecture",
      qualification: "B.Tech Computer Science and Engineering (CSE) Student",
    },
    {
      name: "Sakshi Thombre",
      role: "Frontend Engineering & UI/UX Design",
      qualification: "B.Tech Computer Science and Engineering (CSE) Student",
    },
  ] as Author[],
  institution: {
    name: "Maharashtra Institute of Technology",
    city: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    country: "India",
    department: "Department of Computer Science and Engineering",
  } as Institution,
  studyModes: [
    {
      id: "explain_simply",
      name: "Explain Simply",
      description: "Intuitive, jargon-free explanations using real-world analogies.",
      badge: "Beginner Friendly",
      iconName: "Sparkles",
    },
    {
      id: "exam_prep",
      name: "Exam Preparation",
      description: "High-yield topics, scoring keywords, and expected test questions.",
      badge: "High Yield",
      iconName: "GraduationCap",
    },
    {
      id: "deep_dive",
      name: "Technical Deep Dive",
      description: "Rigorous technical depth, architectural proofs, and edge cases.",
      badge: "Advanced",
      iconName: "Binary",
    },
    {
      id: "socratic_tutor",
      name: "Socratic Tutor",
      description: "Guided conceptual inquiry through thought-provoking hints.",
      badge: "Interactive",
      iconName: "Brain",
    },
    {
      id: "quick_revision",
      name: "Quick Revision",
      description: "Condensed bullet points, cheat-sheets, and formula summaries.",
      badge: "Cramming",
      iconName: "Zap",
    },
  ] as StudyMode[],
};
