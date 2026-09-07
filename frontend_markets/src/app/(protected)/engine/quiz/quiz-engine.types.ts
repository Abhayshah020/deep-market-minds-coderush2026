export type QuizDifficulty =
    | "easy"
    | "medium"
    | "hard";

export type QuizCategory =
    | "macroeconomics"
    | "forex"
    | "trading"
    | "markets"
    | "risk"
    | "monetaryPolicy";

export interface QuizQuestion {
    id: string;

    question: string;

    options: string[];

    correctAnswer: number;

    difficulty: QuizDifficulty;

    category: QuizCategory;

    explanation: string;
}

export interface QuizAnswer {
    questionId: string;

    selectedAnswer: number;

    correct: boolean;

    timestamp: number;
}

export interface QuizResult {
    questionId: string;

    question: string;

    options: string[];

    selectedAnswer: number;

    correctAnswer: number;

    correct: boolean;

    explanation: string;

    difficulty: QuizDifficulty;

    category: QuizCategory;
}

export interface QuizSession {
    id: string;

    totalQuestions: number;

    currentQuestionIndex: number;

    questions: QuizQuestion[];

    answers: QuizAnswer[];

    results: QuizResult[];

    score: number;

    correctAnswers: number;

    incorrectAnswers: number;

    knowledgeScore: number;

    difficulty:
    QuizDifficulty;

    completed: boolean;

    startedAt: number;

    completedAt:
    number | null;
}

export interface QuizSnapshot {
    timestamp: number;

    state: QuizSession | null;
}