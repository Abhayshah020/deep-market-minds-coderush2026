import {
    SimulationClockState,
} from "../../clock/simulation-clock.types";

import {
    DEMO_QUIZ_QUESTIONS,
} from "./demo-quiz-questions";

import {
    QuizAnswer,
    QuizDifficulty,
    QuizQuestion,
    QuizResult,
    QuizSession,
    QuizSnapshot,
} from "./quiz-engine.types";

const TOTAL_QUESTIONS = 10;

const DIFFICULTY_ORDER:
    QuizDifficulty[] = [
        "easy",
        "medium",
        "hard",
    ];

export class QuizEngine {
    private questionBank:
        QuizQuestion[];

    private session:
        QuizSession | null;

    private history:
        Map<number, QuizSnapshot>;

    private currentSimulationTime:
        number;

    constructor(
        initialTime: number,
        questions:
            QuizQuestion[] =
            DEMO_QUIZ_QUESTIONS
    ) {
        this.currentSimulationTime =
            initialTime;

        this.questionBank =
            [...questions];

        this.session = null;

        this.history =
            new Map();

        this.saveSnapshot(
            initialTime
        );
    }

    private getAdaptiveQuestion():
        QuizQuestion | null {
        if (!this.session) {
            return null;
        }

        const difficulty =
            this.session.difficulty;

        const answered =
            new Set(
                this.session.answers.map(
                    answer =>
                        answer.questionId
                )
            );

        const candidates =
            this.questionBank.filter(
                question =>
                    question.difficulty ===
                    difficulty &&
                    !answered.has(
                        question.id
                    )
            );

        if (
            candidates.length ===
            0
        ) {
            const fallback =
                this.questionBank.filter(
                    question =>
                        !answered.has(
                            question.id
                        )
                );

            if (
                fallback.length ===
                0
            ) {
                return null;
            }

            return fallback[
                Math.floor(
                    Math.random() *
                    fallback.length
                )
            ];
        }

        return candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];
    }

    /**
     * Update the quiz engine with the
     * simulation clock.
     *
     * The quiz itself does not automatically
     * answer questions. It simply tracks the
     * current simulation time.
     */
    update(
        clock: SimulationClockState
    ): void {
        const targetTime =
            clock.currentTime;

        if (
            targetTime ===
            this.currentSimulationTime
        ) {
            return;
        }

        if (
            targetTime <
            this.currentSimulationTime
        ) {
            this.processBackward(
                targetTime
            );

            this.currentSimulationTime =
                targetTime;

            return;
        }

        this.currentSimulationTime =
            targetTime;

        this.saveSnapshot(
            targetTime
        );
    }

    /**
     * Start a new 10-question quiz.
     */
    startQuiz(): QuizSession {
        const questions =
            this.selectQuestions(
                TOTAL_QUESTIONS
            );

        this.session = {
            id:
                `quiz-${this.currentSimulationTime}-${Date.now()}`,

            totalQuestions:
                questions.length,

            currentQuestionIndex:
                0,

            questions,

            answers: [],

            results: [],

            score: 0,

            correctAnswers: 0,

            incorrectAnswers: 0,

            knowledgeScore: 0,

            difficulty:
                "easy",

            completed: false,

            startedAt:
                this.currentSimulationTime,

            completedAt:
                null,
        };

        this.saveSnapshot(
            this.currentSimulationTime
        );

        return this.cloneSession(
            this.session
        );
    }

    /**
     * Get the currently displayed question.
     */
    getCurrentQuestion():
        QuizQuestion | null {
        if (!this.session) {
            return null;
        }

        if (
            this.session
                .completed
        ) {
            return null;
        }

        return (
            this.session.questions[
            this.session
                .currentQuestionIndex
            ] ?? null
        );
    }

    /**
     * Submit an answer.
     */
    answerQuestion(
        selectedAnswer: number
    ):
        QuizResult | null {
        if (!this.session) {
            return null;
        }

        if (
            this.session
                .completed
        ) {
            return null;
        }

        const question =
            this.getCurrentQuestion();

        if (!question) {
            return null;
        }

        if (
            selectedAnswer <
            0 ||
            selectedAnswer >=
            question
                .options
                .length
        ) {
            return null;
        }

        /*
         * Prevent answering the same
         * question twice.
         */
        const alreadyAnswered =
            this.session.answers.some(
                answer =>
                    answer.questionId ===
                    question.id
            );

        if (
            alreadyAnswered
        ) {
            return null;
        }

        const correct =
            selectedAnswer ===
            question.correctAnswer;

        const answer:
            QuizAnswer = {
            questionId:
                question.id,

            selectedAnswer,

            correct,

            timestamp:
                this.currentSimulationTime,
        };

        this.session.answers.push(
            answer
        );

        if (correct) {
            this.session
                .correctAnswers +=
                1;

            /*
             * Difficulty contributes
             * different score weights.
             */
            this.session.score +=
                this.getDifficultyScore(
                    question.difficulty
                );
        } else {
            this.session
                .incorrectAnswers +=
                1;
        }

        const result:
            QuizResult = {
            questionId:
                question.id,

            question:
                question.question,

            options:
                [...question.options],

            selectedAnswer,

            correctAnswer:
                question.correctAnswer,

            correct,

            explanation:
                question.explanation,

            difficulty:
                question.difficulty,

            category:
                question.category,
        };

        this.session.results.push(
            result
        );

        this.updateKnowledgeScore();

        this.adaptDifficulty(
            correct
        );

        this.session
            .currentQuestionIndex +=
            1;

        if (
            this.session
                .currentQuestionIndex >=
            this.session
                .questions
                .length
        ) {
            this.completeQuiz();
        }

        this.saveSnapshot(
            this.currentSimulationTime
        );

        return {
            ...result,

            options:
                [...result.options],
        };
    }

    /**
     * Select questions.
     *
     * Initial distribution attempts
     * to cover all three difficulties.
     */
    private selectQuestions(
        count: number
    ): QuizQuestion[] {
        const shuffled =
            this.shuffle(
                this.questionBank
            );

        const selected:
            QuizQuestion[] = [];

        /*
         * First guarantee representation
         * from each difficulty.
         */
        for (
            const difficulty of
            DIFFICULTY_ORDER
        ) {
            const question =
                shuffled.find(
                    item =>
                        item.difficulty ===
                        difficulty
                );

            if (
                question &&
                !selected.includes(
                    question
                )
            ) {
                selected.push(
                    question
                );
            }
        }

        /*
         * Fill remaining slots.
         */
        for (
            const question of
            shuffled
        ) {
            if (
                selected.length >=
                count
            ) {
                break;
            }

            if (
                selected.includes(
                    question
                )
            ) {
                continue;
            }

            selected.push(
                question
            );
        }

        return this.shuffle(
            selected
        ).slice(
            0,
            count
        );
    }

    /**
     * Adaptive difficulty.
     *
     * 2 consecutive correct:
     *     increase difficulty.
     *
     * 2 consecutive incorrect:
     *     decrease difficulty.
     */
    private adaptDifficulty(
        correct: boolean
    ): void {
        if (!this.session) {
            return;
        }

        const results =
            this.session.results;

        if (
            results.length < 2
        ) {
            return;
        }

        const previous =
            results[
            results.length -
            2
            ];

        const current =
            results[
            results.length -
            1
            ];

        if (
            correct &&
            previous.correct
        ) {
            this.increaseDifficulty();

            return;
        }

        if (
            !correct &&
            !previous.correct
        ) {
            this.decreaseDifficulty();
        }
    }

    private increaseDifficulty(): void {
        if (!this.session) {
            return;
        }

        const index =
            DIFFICULTY_ORDER.indexOf(
                this.session
                    .difficulty
            );

        if (
            index <
            DIFFICULTY_ORDER
                .length -
            1
        ) {
            this.session
                .difficulty =
                DIFFICULTY_ORDER[
                index + 1
                ];
        }
    }

    private decreaseDifficulty(): void {
        if (!this.session) {
            return;
        }

        const index =
            DIFFICULTY_ORDER.indexOf(
                this.session
                    .difficulty
            );

        if (index > 0) {
            this.session
                .difficulty =
                DIFFICULTY_ORDER[
                index - 1
                ];
        }
    }

    private getDifficultyScore(
        difficulty:
            QuizDifficulty
    ): number {
        switch (
        difficulty
        ) {
            case "easy":
                return 1;

            case "medium":
                return 2;

            case "hard":
                return 3;
        }
    }

    /**
     * Knowledge score from 0-100.
     */
    private updateKnowledgeScore(): void {
        if (!this.session) {
            return;
        }

        const totalPossible =
            this.session.questions
                .reduce(
                    (
                        total,
                        question
                    ) =>
                        total +
                        this.getDifficultyScore(
                            question.difficulty
                        ),
                    0
                );

        if (
            totalPossible ===
            0
        ) {
            this.session
                .knowledgeScore = 0;

            return;
        }

        this.session
            .knowledgeScore =
            Math.round(
                (
                    this.session.score /
                    totalPossible
                ) *
                100
            );
    }

    private completeQuiz(): void {
        if (!this.session) {
            return;
        }

        this.session.completed =
            true;

        this.session.completedAt =
            this.currentSimulationTime;

        this.updateKnowledgeScore();
    }

    /**
     * Current session.
     */
    getSession():
        QuizSession | null {
        if (!this.session) {
            return null;
        }

        return this.cloneSession(
            this.session
        );
    }

    /**
     * Reset current quiz.
     */
    resetQuiz(): void {
        this.session = null;

        this.saveSnapshot(
            this.currentSimulationTime
        );
    }

    private processBackward(
        targetTime: number
    ): void {
        const snapshot =
            this.findSnapshotAtOrBefore(
                targetTime
            );

        if (!snapshot) {
            return;
        }

        this.session =
            snapshot.state
                ? this.cloneSession(
                    snapshot.state
                )
                : null;
    }

    private saveSnapshot(
        timestamp: number
    ): void {
        this.history.set(
            timestamp,
            {
                timestamp,

                state:
                    this.session
                        ? this.cloneSession(
                            this.session
                        )
                        : null as never,
            }
        );
    }

    private findSnapshotAtOrBefore(
        timestamp: number
    ): QuizSnapshot | null {
        let result:
            QuizSnapshot | null =
            null;

        for (
            const snapshot of
            this.history.values()
        ) {
            if (
                snapshot.timestamp <=
                timestamp
            ) {
                if (
                    result === null ||
                    snapshot.timestamp >
                    result.timestamp
                ) {
                    result =
                        snapshot;
                }
            }
        }

        return result;
    }

    private shuffle<T>(
        array: T[]
    ): T[] {
        const result =
            [...array];

        for (
            let i =
                result.length - 1;
            i > 0;
            i--
        ) {
            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );

            [
                result[i],
                result[j],
            ] = [
                    result[j],
                    result[i],
                ];
        }

        return result;
    }

    private cloneSession(
        session: QuizSession
    ): QuizSession {
        return {
            ...session,

            questions:
                session.questions.map(
                    question => ({
                        ...question,

                        options:
                            [
                                ...question.options,
                            ],
                    })
                ),

            answers:
                session.answers.map(
                    answer => ({
                        ...answer,
                    })
                ),

            results:
                session.results.map(
                    result => ({
                        ...result,

                        options:
                            [
                                ...result.options,
                            ],
                    })
                ),
        };
    }

    getHistory():
        QuizSnapshot[] {
        return Array.from(
            this.history.values()
        ).sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );
    }
}