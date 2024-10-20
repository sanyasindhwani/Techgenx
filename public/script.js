const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const submitButton = document.getElementById('submit-button');

// Load quiz questions from server
async function loadQuiz() {
    try {
        const response = await fetch('/quiz-questions'); // Fetch quiz questions from backend
        const quizData = await response.json(); // Parse JSON data

        // Generate HTML for each question
        quizData.questions.forEach(question => {
            const questionElement = document.createElement('div');
            questionElement.innerHTML = `
                        <p>${question.question}</p>
                        ${question.options.map(option => `
                            <label>
                                <input type="radio" name="question${question.id}" value="${option}"> ${option}
                            </label>
                        `).join('')}
                    `;
            quizContainer.appendChild(questionElement);
        });
    } catch (error) {
        console.error('Error loading quiz:', error);
        resultContainer.textContent = 'Error loading quiz.';
    }
}

// Submit quiz answers to server
async function submitQuiz() {
    const answers = [];
    const questions = document.querySelectorAll('[name^="question"]');

    // Collect selected answers
    questions.forEach(question => {
        if (question.checked) {
            const id = parseInt(question.name.replace('question', ''));
            answers.push({ id, selectedOption: question.value });
        }
    });

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });

        const result = await response.json(); // Parse result
        resultContainer.innerHTML = `Your score is ${result.score}.`;
    } catch (error) {
        console.error('Error submitting quiz:', error);
        resultContainer.textContent = 'Error submitting quiz.';
    }
}

// Load quiz questions on page load
window.onload = loadQuiz;

// Attach event listener to the submit button
submitButton.onclick = submitQuiz;