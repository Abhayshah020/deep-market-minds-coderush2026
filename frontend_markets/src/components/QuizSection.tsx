"use client";

import "./QuizSection.css";

interface QuizSectionProps {
    quizSession: any;
    selectedQuizAnswer: number | null;
    quizResult: any;
    quizAnswerLocked: boolean;

    handleStartQuiz: () => void;
    handleResetQuiz: () => void;
    handleQuizAnswer: (index: number) => void;
    handleQuizNext: () => void;
}

export default function QuizSection({
    quizSession,
    selectedQuizAnswer,
    quizResult,
    quizAnswerLocked,
    handleStartQuiz,
    handleResetQuiz,
    handleQuizAnswer,
    handleQuizNext,
}: QuizSectionProps) {
    if (!quizSession) {
        return null;
    }

    return (
        <section className="quiz-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="quiz-header">

                <div className="quiz-title-area">

                    <div className="quiz-label">
                        <span>🎮</span>
                        KNOWLEDGE QUEST
                    </div>

                    <h2>
                        Market
                        <br />
                        <span>Challenge!</span>
                    </h2>

                    <p>
                        Test what you know about money,
                        markets, economics and the forces
                        that move the world.
                    </p>

                </div>

                <div className="quiz-score-box">

                    <span className="score-icon">
                        ⭐
                    </span>

                    <div>
                        <span className="score-label">
                            KNOWLEDGE SCORE
                        </span>

                        <strong>
                            {quizSession.knowledgeScore}%
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                GAME STATUS
            ================================================= */}

            <div className="quiz-status-bar">

                {!quizSession.completed && (
                    <div className="quiz-difficulty">

                        <span>
                            LEVEL
                        </span>

                        <strong
                            className={
                                quizSession.difficulty ===
                                "hard"
                                    ? "hard"
                                    : quizSession.difficulty ===
                                        "medium"
                                        ? "medium"
                                        : "easy"
                            }
                        >
                            {quizSession.difficulty.toUpperCase()}
                        </strong>

                    </div>
                )}

                <div className="quiz-topic">
                    <span>🧠</span>
                    Macro • Markets • Trading
                </div>

            </div>


            {/* =================================================
                COMPLETED
            ================================================= */}

            {quizSession.completed ? (

                <div className="quiz-completed">

                    <div className="completion-stars">
                        {quizSession.knowledgeScore >= 80
                            ? "🏆"
                            : quizSession.knowledgeScore >=
                                50
                                ? "🌟"
                                : "💪"}
                    </div>

                    <div className="completion-score">
                        {quizSession.knowledgeScore}%
                    </div>

                    <h3>
                        {quizSession.knowledgeScore >=
                            80
                            ? "Market Master!"
                            : quizSession.knowledgeScore >=
                                50
                                ? "Great Job!"
                                : "Keep Learning!"}
                    </h3>

                    <p className="completion-message">
                        You finished the challenge.
                        Every question is another step
                        toward understanding how markets
                        work.
                    </p>


                    {/* RESULTS */}

                    <div className="quiz-results">

                        <div className="result correct-result">

                            <span className="result-icon">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    {
                                        quizSession.correctAnswers
                                    }
                                </strong>

                                <span>
                                    Correct
                                </span>
                            </div>

                        </div>


                        <div className="result incorrect-result">

                            <span className="result-icon">
                                ×
                            </span>

                            <div>
                                <strong>
                                    {
                                        quizSession.incorrectAnswers
                                    }
                                </strong>

                                <span>
                                    Incorrect
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="completion-actions">

                        <button
                            type="button"
                            className="quiz-primary-button"
                            onClick={
                                handleStartQuiz
                            }
                        >
                            🎮 Play Again
                        </button>

                        <button
                            type="button"
                            className="quiz-secondary-button"
                            onClick={
                                handleResetQuiz
                            }
                        >
                            Reset
                        </button>

                    </div>

                </div>

            ) : (

                <>
                    {(() => {

                        const question =
                            quizSession.questions[
                                quizSession
                                    .currentQuestionIndex
                            ];

                        if (!question) {
                            return null;
                        }

                        const progress =
                            (quizSession.currentQuestionIndex /
                                quizSession.totalQuestions) *
                            100;

                        return (
                            <div className="quiz-game">

                                {/* =================================
                                    QUESTION TOP
                                ================================= */}

                                <div className="question-meta">

                                    <div className="question-number">

                                        <span>
                                            QUESTION
                                        </span>

                                        <strong>
                                            {
                                                quizSession.currentQuestionIndex +
                                                1
                                            }
                                        </strong>

                                        <small>
                                            /
                                            {
                                                quizSession.totalQuestions
                                            }
                                        </small>

                                    </div>

                                    <div className="question-category">
                                        📚{" "}
                                        {
                                            question.category
                                        }
                                    </div>

                                </div>


                                {/* =================================
                                    PROGRESS
                                ================================= */}

                                <div className="quiz-progress">

                                    <div
                                        className="quiz-progress-fill"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />

                                </div>


                                {/* =================================
                                    QUESTION CARD
                                ================================= */}

                                <div className="question-card">

                                    <div className="question-icon">
                                        💭
                                    </div>

                                    <div>

                                        <span className="question-kicker">
                                            MARKET MYSTERY
                                        </span>

                                        <h3>
                                            {
                                                question.question
                                            }
                                        </h3>

                                    </div>

                                </div>


                                {/* =================================
                                    ANSWERS
                                ================================= */}

                                <div className="quiz-options">

                                    {question.options.map(
                                        (
                                            option: string,
                                            index: number,
                                        ) => {

                                            const isSelected =
                                                selectedQuizAnswer ===
                                                index;

                                            const isCorrect =
                                                quizResult &&
                                                quizResult.correctAnswer ===
                                                index;

                                            const isWrong =
                                                quizResult &&
                                                isSelected &&
                                                !quizResult.correct;

                                            let optionClass =
                                                "quiz-option";

                                            if (
                                                isCorrect
                                            ) {
                                                optionClass +=
                                                    " correct";
                                            } else if (
                                                isWrong
                                            ) {
                                                optionClass +=
                                                    " wrong";
                                            } else if (
                                                isSelected
                                            ) {
                                                optionClass +=
                                                    " selected";
                                            }

                                            return (
                                                <button
                                                    key={`${question.id}-${index}`}
                                                    type="button"
                                                    disabled={
                                                        quizAnswerLocked
                                                    }
                                                    onClick={() =>
                                                        handleQuizAnswer(
                                                            index,
                                                        )
                                                    }
                                                    className={
                                                        optionClass
                                                    }
                                                >

                                                    <span className="option-letter">
                                                        {String.fromCharCode(
                                                            65 +
                                                            index,
                                                        )}
                                                    </span>

                                                    <span className="option-text">
                                                        {
                                                            option
                                                        }
                                                    </span>

                                                    {isCorrect && (
                                                        <span className="option-result">
                                                            ✓
                                                        </span>
                                                    )}

                                                    {isWrong && (
                                                        <span className="option-result">
                                                            ×
                                                        </span>
                                                    )}

                                                </button>
                                            );
                                        },
                                    )}

                                </div>


                                {/* =================================
                                    EXPLANATION
                                ================================= */}

                                {quizResult && (

                                    <div
                                        className={`quiz-feedback ${
                                            quizResult.correct
                                                ? "feedback-correct"
                                                : "feedback-wrong"
                                        }`}
                                    >

                                        <div className="feedback-heading">

                                            <span className="feedback-icon">
                                                {quizResult.correct
                                                    ? "🎉"
                                                    : "💡"}
                                            </span>

                                            <strong>
                                                {quizResult.correct
                                                    ? "Nice! You got it!"
                                                    : "Not quite!"}
                                            </strong>

                                        </div>

                                        <p>
                                            {
                                                quizResult.explanation
                                            }
                                        </p>

                                        <button
                                            type="button"
                                            className="next-question-button"
                                            onClick={
                                                handleQuizNext
                                            }
                                        >
                                            {quizSession.currentQuestionIndex >=
                                                quizSession.totalQuestions
                                                ? "🏆 See My Result"
                                                : "Next Question →"}
                                        </button>

                                    </div>

                                )}

                            </div>
                        );
                    })()}
                </>
            )}

        </section>
    );
}