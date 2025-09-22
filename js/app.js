// ===== Quiz App - Saúde da Mulher =====
// Versão unificada com melhores práticas e funcionalidades completas

// ===== Estado Global =====
const state = {
  questions: [],
  currentQuestion: 0,
  answers: {},
  confidence: {},
  marked: new Set(),
  striked: {},
  startTime: null,
  endTime: null,
  questionTimes: {},
  currentQuestionStart: null,
  mode: 'simulado', // 'simulado' ou 'estudo'
  realtimeScore: true,
  theme: localStorage.getItem('theme') || 'light'
};

// ===== Seletores DOM =====
const elements = {
  screens: {
    home: document.getElementById('homeScreen'),
    quiz: document.getElementById('quizScreen'),
    results: document.getElementById('resultsScreen')
  },
  quiz: {
    questionNumber: document.getElementById('currentQuestion'),
    totalQuestions: document.getElementById('totalQuestions'),
    questionTags: document.getElementById('questionTags'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    confidenceSlider: document.getElementById('confidenceSlider'),
    confidenceValue: document.getElementById('confidenceValue'),
    markButton: document.getElementById('markQuestion'),
    prevButton: document.getElementById('prevQuestion'),
    nextButton: document.getElementById('nextQuestion'),
    finishButton: document.getElementById('finishQuiz'),
    timerDisplay: document.getElementById('timerDisplay'),
    progressFill: document.getElementById('progressFill'),
    scoreDisplay: document.querySelector('.score-value')
  },
  results: {
    finalScore: document.getElementById('finalScore'),
    scoreDetails: document.getElementById('scoreDetails'),
    totalTime: document.getElementById('totalTime'),
    brierScore: document.getElementById('brierScore'),
    avgConfidence: document.getElementById('avgConfidence'),
    themeChart: document.getElementById('themeChart'),
    themeTable: document.getElementById('themeTable'),
    recommendations: document.getElementById('recommendations'),
    questionReview: document.getElementById('questionReview')
  }
};

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadQuestions();
  setupEventListeners();
  applyTheme(state.theme);

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
});

// ===== Carregamento de Dados =====
async function loadQuestions() {
  try {
    const response = await fetch('data/questions.json');
    const data = await response.json();

    // Filtrar apenas questões V3 (20 questões oficiais)
    state.questions = data.questions.filter(q => q.versao === 'V3');

    // Embaralhar questões se modo simulado
    if (state.mode === 'simulado') {
      state.questions = shuffleArray([...state.questions]);
    }

    elements.quiz.totalQuestions.textContent = state.questions.length;
  } catch (error) {
    console.error('Erro ao carregar questões:', error);
    showToast('Erro ao carregar questões. Por favor, recarregue a página.');
  }
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Botão Iniciar
  document.getElementById('startQuiz').addEventListener('click', startQuiz);

  // Navegação
  elements.quiz.prevButton.addEventListener('click', () => navigateQuestion(-1));
  elements.quiz.nextButton.addEventListener('click', () => navigateQuestion(1));
  elements.quiz.finishButton.addEventListener('click', finishQuiz);

  // Marcar questão
  elements.quiz.markButton.addEventListener('click', toggleMarkQuestion);

  // Slider de confiança
  elements.quiz.confidenceSlider.addEventListener('input', updateConfidence);

  // Modo de quiz
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => changeMode(btn.dataset.mode));
  });

  // Tema
  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

  // Resultados
  document.getElementById('restartQuiz').addEventListener('click', restartQuiz);
  document.getElementById('exportResults').addEventListener('click', exportResults);
}

// ===== Controle de Quiz =====
function startQuiz() {
  state.startTime = Date.now();
  state.currentQuestion = 0;
  state.answers = {};
  state.confidence = {};
  state.marked = new Set();
  state.striked = {};
  state.questionTimes = {};

  showScreen('quiz');
  renderQuestion();
  startTimer();
}

function renderQuestion() {
  const question = state.questions[state.currentQuestion];

  // Atualizar número da questão
  elements.quiz.questionNumber.textContent = state.currentQuestion + 1;

  // Atualizar progresso
  const progress = ((state.currentQuestion + 1) / state.questions.length) * 100;
  elements.quiz.progressFill.style.width = `${progress}%`;

  // Renderizar tags
  elements.quiz.questionTags.innerHTML = question.tags
    .map(tag => `<span class="tag">${tag}</span>`)
    .join('');

  // Renderizar enunciado
  elements.quiz.questionText.textContent = question.enunciado;

  // Renderizar alternativas
  renderOptions(question);

  // Restaurar confiança
  const savedConfidence = state.confidence[question.id] || 50;
  elements.quiz.confidenceSlider.value = savedConfidence;
  elements.quiz.confidenceValue.textContent = `${savedConfidence}%`;

  // Atualizar botão de marcação
  elements.quiz.markButton.classList.toggle('marked', state.marked.has(question.id));

  // Atualizar navegação
  elements.quiz.prevButton.disabled = state.currentQuestion === 0;
  elements.quiz.nextButton.style.display = state.currentQuestion === state.questions.length - 1 ? 'none' : 'flex';
  elements.quiz.finishButton.classList.toggle('hidden', state.currentQuestion !== state.questions.length - 1);

  // Atualizar score em tempo real
  if (state.realtimeScore) {
    updateRealtimeScore();
  }

  // Registrar tempo da questão
  state.currentQuestionStart = Date.now();
}

function renderOptions(question) {
  const container = elements.quiz.optionsContainer;
  container.innerHTML = '';

  question.alternativas.forEach(alt => {
    const option = document.createElement('div');
    option.className = 'option';
    option.dataset.id = alt.id;

    // Verificar se foi selecionada
    if (state.answers[question.id] === alt.id) {
      option.classList.add('selected');
    }

    // Verificar se foi riscada
    if (state.striked[question.id]?.has(alt.id)) {
      option.classList.add('striked');
    }

    option.innerHTML = `
      <span class="option-label">${alt.id}</span>
      <span class="option-text">${alt.texto}</span>
    `;

    option.addEventListener('click', () => selectOption(alt.id));
    option.addEventListener('dblclick', () => toggleStrike(alt.id));

    container.appendChild(option);
  });
}

function selectOption(optionId) {
  const question = state.questions[state.currentQuestion];

  // Salvar resposta
  state.answers[question.id] = optionId;
  state.confidence[question.id] = parseInt(elements.quiz.confidenceSlider.value);

  // Atualizar visual
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.id === optionId);
  });

  // Se modo estudo, mostrar feedback
  if (state.mode === 'estudo') {
    showFeedback(question, optionId);
  }

  // Atualizar score em tempo real
  if (state.realtimeScore) {
    updateRealtimeScore();
  }
}

function toggleStrike(optionId) {
  const question = state.questions[state.currentQuestion];

  if (!state.striked[question.id]) {
    state.striked[question.id] = new Set();
  }

  if (state.striked[question.id].has(optionId)) {
    state.striked[question.id].delete(optionId);
  } else {
    state.striked[question.id].add(optionId);
  }

  renderQuestion();
}

function showFeedback(question, selectedId) {
  const isCorrect = selectedId === question.correta;

  document.querySelectorAll('.option').forEach(opt => {
    if (opt.dataset.id === question.correta) {
      opt.classList.add('correct');
    } else if (opt.dataset.id === selectedId && !isCorrect) {
      opt.classList.add('incorrect');
    }
  });

  // Mostrar explicação se disponível
  if (question.explicacao) {
    showToast(question.explicacao, isCorrect ? 'success' : 'error');
  }
}

function navigateQuestion(direction) {
  // Salvar tempo da questão atual
  if (state.currentQuestionStart) {
    const question = state.questions[state.currentQuestion];
    const timeSpent = Date.now() - state.currentQuestionStart;
    state.questionTimes[question.id] = (state.questionTimes[question.id] || 0) + timeSpent;
  }

  state.currentQuestion += direction;
  state.currentQuestion = Math.max(0, Math.min(state.currentQuestion, state.questions.length - 1));
  renderQuestion();
}

function toggleMarkQuestion() {
  const question = state.questions[state.currentQuestion];

  if (state.marked.has(question.id)) {
    state.marked.delete(question.id);
  } else {
    state.marked.add(question.id);
  }

  elements.quiz.markButton.classList.toggle('marked');
}

function updateConfidence() {
  const value = elements.quiz.confidenceSlider.value;
  elements.quiz.confidenceValue.textContent = `${value}%`;

  const question = state.questions[state.currentQuestion];
  state.confidence[question.id] = parseInt(value);
}

function updateRealtimeScore() {
  const { correct, total } = calculateScore();
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  elements.quiz.scoreDisplay.textContent = `${percentage}%`;
}

// ===== Timer =====
let timerInterval;

function startTimer() {
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    elements.quiz.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ===== Finalização e Análise =====
function finishQuiz() {
  state.endTime = Date.now();
  stopTimer();

  // Salvar tempo da última questão
  if (state.currentQuestionStart) {
    const question = state.questions[state.currentQuestion];
    const timeSpent = Date.now() - state.currentQuestionStart;
    state.questionTimes[question.id] = (state.questionTimes[question.id] || 0) + timeSpent;
  }

  showResults();
  showScreen('results');
}

function calculateScore() {
  let correct = 0;
  let total = 0;

  state.questions.forEach(question => {
    if (state.answers[question.id]) {
      total++;
      if (state.answers[question.id] === question.correta) {
        correct++;
      }
    }
  });

  return { correct, total };
}

function calculateBrierScore() {
  let brierSum = 0;
  let count = 0;

  state.questions.forEach(question => {
    if (state.answers[question.id] && state.confidence[question.id] !== undefined) {
      const isCorrect = state.answers[question.id] === question.correta ? 1 : 0;
      const confidence = state.confidence[question.id] / 100;
      brierSum += Math.pow(confidence - isCorrect, 2);
      count++;
    }
  });

  return count > 0 ? (brierSum / count).toFixed(3) : 0;
}

function analyzeByTheme() {
  const themeData = {};

  state.questions.forEach(question => {
    if (state.answers[question.id]) {
      question.tags.forEach(tag => {
        if (!themeData[tag]) {
          themeData[tag] = { correct: 0, total: 0, time: 0 };
        }

        themeData[tag].total++;
        if (state.answers[question.id] === question.correta) {
          themeData[tag].correct++;
        }
        themeData[tag].time += state.questionTimes[question.id] || 0;
      });
    }
  });

  return themeData;
}

function showResults() {
  const { correct, total } = calculateScore();
  const percentage = Math.round((correct / total) * 100);

  // Score geral
  elements.results.finalScore.textContent = `${percentage}%`;
  elements.results.scoreDetails.textContent = `${correct}/${total}`;

  // Animação do círculo de progresso
  const progressCircle = document.querySelector('.progress-ring-progress');
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (percentage / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;

  // Tempo total
  const totalTime = Math.floor((state.endTime - state.startTime) / 1000);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  elements.results.totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Brier Score
  elements.results.brierScore.textContent = calculateBrierScore();

  // Confiança média
  const confidences = Object.values(state.confidence);
  const avgConfidence = confidences.length > 0
    ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
    : 0;
  elements.results.avgConfidence.textContent = `${avgConfidence}%`;

  // Análise por tema
  showThemeAnalysis();

  // Recomendações
  showRecommendations();

  // Revisão de questões
  showQuestionReview();
}

function showThemeAnalysis() {
  const themeData = analyzeByTheme();

  // Preparar dados para o gráfico
  const labels = Object.keys(themeData);
  const accuracy = labels.map(theme =>
    Math.round((themeData[theme].correct / themeData[theme].total) * 100)
  );

  // Criar gráfico
  new Chart(elements.results.themeChart, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Acurácia (%)',
        data: accuracy,
        backgroundColor: accuracy.map(acc =>
          acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444'
        ),
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: value => `${value}%`
          }
        }
      }
    }
  });

  // Criar tabela
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Tema</th>
          <th>Acertos</th>
          <th>Total</th>
          <th>Acurácia</th>
        </tr>
      </thead>
      <tbody>
        ${labels.map(theme => `
          <tr>
            <td>${theme}</td>
            <td>${themeData[theme].correct}</td>
            <td>${themeData[theme].total}</td>
            <td>${Math.round((themeData[theme].correct / themeData[theme].total) * 100)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  elements.results.themeTable.innerHTML = tableHTML;
}

function showRecommendations() {
  const themeData = analyzeByTheme();
  const weakThemes = [];

  Object.entries(themeData).forEach(([theme, data]) => {
    const accuracy = (data.correct / data.total) * 100;
    if (accuracy < 70) {
      weakThemes.push({ theme, accuracy: Math.round(accuracy) });
    }
  });

  weakThemes.sort((a, b) => a.accuracy - b.accuracy);

  const recommendationsHTML = weakThemes.length > 0
    ? weakThemes.map(({ theme, accuracy }) => `
        <div class="recommendation">
          <h4>${theme}</h4>
          <p>Acurácia: ${accuracy}%. Recomenda-se revisar este tema com atenção especial.</p>
        </div>
      `).join('')
    : '<p>Excelente desempenho! Continue mantendo seus estudos em dia.</p>';

  elements.results.recommendations.innerHTML = recommendationsHTML;
}

function showQuestionReview() {
  const reviewHTML = state.questions.map(question => {
    const userAnswer = state.answers[question.id];
    const isCorrect = userAnswer === question.correta;
    const confidence = state.confidence[question.id] || 0;

    return `
      <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="review-header">
          <div class="review-question">Q${state.questions.indexOf(question) + 1}: ${question.enunciado}</div>
          <div class="review-status ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '✓ Correto' : '✗ Incorreto'} | Confiança: ${confidence}%
          </div>
        </div>
        <div class="review-answer">
          ${question.alternativas.map(alt => {
            const classes = [];
            if (alt.id === userAnswer) classes.push('user-answer');
            if (alt.id === question.correta) classes.push('correct-answer');

            return `
              <div class="review-option ${classes.join(' ')}">
                <strong>${alt.id})</strong> ${alt.texto}
                ${alt.id === userAnswer ? ' (Sua resposta)' : ''}
                ${alt.id === question.correta ? ' (Correta)' : ''}
              </div>
            `;
          }).join('')}
        </div>
        ${question.explicacao ? `
          <div class="review-explanation">
            <strong>Explicação:</strong> ${question.explicacao}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  elements.results.questionReview.innerHTML = reviewHTML;
}

// ===== Utilitários =====
function showScreen(screenName) {
  Object.values(elements.screens).forEach(screen => {
    screen.classList.remove('active');
  });
  elements.screens[screenName].classList.add('active');
}

function changeMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Se mudar durante o quiz, reiniciar
  if (elements.screens.quiz.classList.contains('active')) {
    if (confirm('Mudar o modo reiniciará o quiz. Deseja continuar?')) {
      startQuiz();
    }
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = document.querySelector('.theme-toggle');
  toggle.querySelector('.sun-icon').classList.toggle('hidden', theme === 'dark');
  toggle.querySelector('.moon-icon').classList.toggle('hidden', theme === 'light');
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  localStorage.setItem('theme', state.theme);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  toastMessage.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function restartQuiz() {
  if (confirm('Deseja reiniciar o quiz?')) {
    showScreen('home');
  }
}

function exportResults() {
  const { correct, total } = calculateScore();
  const percentage = Math.round((correct / total) * 100);

  const data = {
    date: new Date().toISOString(),
    score: { correct, total, percentage },
    brierScore: calculateBrierScore(),
    mode: state.mode,
    timeSpent: Math.floor((state.endTime - state.startTime) / 1000),
    answers: state.answers,
    confidence: state.confidence,
    themeAnalysis: analyzeByTheme()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-results-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Resultados exportados com sucesso!', 'success');
}

// ===== Export Módulo =====
export { state, startQuiz, finishQuiz };