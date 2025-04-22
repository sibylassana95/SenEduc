document.addEventListener('DOMContentLoaded', () => {
    const operationButtons = document.querySelectorAll('.operation-btn');
    const tableButtons = document.querySelectorAll('.table-btn');
    const startBtn = document.getElementById('start-btn');
    const gameArea = document.getElementById('game-area');
    const numButtons = document.querySelectorAll('.num-btn');
    const clearBtn = document.getElementById('clear-btn');
    const validateBtn = document.getElementById('validate-btn');
    const questionDiv = document.getElementById('question');
    const result = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const emoji = document.getElementById('emoji');
    const selectAllBtn = document.getElementById('select-all-btn');
    const progressBar = document.getElementById('progress-bar');
    const statsDiv = document.getElementById('stats');
    const totalCount = document.getElementById('total-count');
    const successCount = document.getElementById('success-count');
    const errorCount = document.getElementById('error-count');
    const successRate = document.getElementById('success-rate');
    const errorHistory = document.getElementById('error-history');
    const errorList = document.getElementById('error-list');
    const correctSound = document.getElementById('correctSound');
    const incorrectSound = document.getElementById('incorrectSound');
    const themeToggle = document.getElementById('theme-toggle');
  
    let selectedOperation = null;
    let selectedTables = [];
    let currentQuestion = {};
    let lastQuestion = null;
    let stats = { total: 0, success: 0, errors: 0 };
    let errorHistoryList = [];
    let streak = 0;
    let bestStreak = 0;
    let difficulty = 'easy';
    let selectedMode = 'practice';
    let timerInterval = null;
    let timeLeft = 20;
    const timerBar = document.querySelector('.timer-bar');
    const timeLeftSpan = document.getElementById('time-left');
    const timerDiv = document.getElementById('timer');
    const modeButtons = document.querySelectorAll('.mode-btn');
  
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
  
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          difficultyButtons.forEach(b => b.classList.remove('selected')); 
          btn.classList.add('selected');
          difficulty = btn.dataset.difficulty;
      });
    });
  
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMode = btn.dataset.mode;
        timerDiv.style.display = selectedMode === 'timed' ? 'block' : 'none';
      });
    });
  
    function playSound(isCorrect) {
        const sound = isCorrect ? correctSound : incorrectSound;
        sound.currentTime = 0;
        sound.play().catch(error => console.log('Erreur de lecture audio:', error));
    }
  
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.classList.add('animate__animated', 'animate__pulse');
        });
        button.addEventListener('mouseleave', () => {
            button.classList.remove('animate__animated', 'animate__pulse');
        });
    });
  
    operationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            operationButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOperation = btn.dataset.operation;
            btn.classList.add('animate__animated', 'animate__rubberBand');
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__rubberBand'), 1000);
        });
    });
  
    tableButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn === selectAllBtn) return;
            btn.classList.toggle('selected');
            const number = parseInt(btn.dataset.number);
            if (selectedTables.includes(number)) {
                selectedTables = selectedTables.filter(n => n !== number);
            } else {
                selectedTables.push(number);
            }
            btn.classList.add('animate__animated', 'animate__bounce');
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__bounce'), 1000);
        });
    });
  
    selectAllBtn.addEventListener('click', () => {
        const isSelecting = selectAllBtn.textContent === 'Toutes';
        selectedTables = [];
        tableButtons.forEach(btn => {
            if (btn === selectAllBtn) return;
            if (isSelecting) {
                btn.classList.add('selected', 'animate__animated', 'animate__bounce');
                const number = parseInt(btn.dataset.number);
                selectedTables.push(number);
            } else {
                btn.classList.remove('selected');
            }
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__bounce'), 1000);
        });
        selectAllBtn.textContent = isSelecting ? 'Aucune' : 'Toutes';
        selectAllBtn.classList.toggle('selected', isSelecting);
    });
  
    function generateQuestion() {
        if (selectedTables.length === 0 || !selectedOperation) return null;
        let newQuestion;
        do {
            const num1 = selectedTables[Math.floor(Math.random() * selectedTables.length)];
            let num2;
  
            switch (selectedOperation) {
                case 'addition':
                    num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20)) + 1;
                    newQuestion = {
                        num1, num2,
                        operator: '+',
                        answer: num1 + num2
                    };
                    break;
                case 'subtraction':
                    const maxNum = Math.max(...selectedTables);
                    num2 = Math.floor(Math.random() * Math.min(maxNum, difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20)) + 1;
                    const result = Math.floor(Math.random() * (maxNum - num2 + 1)) + num2;
                    newQuestion = {
                        num1: result,
                        num2: num2,
                        operator: '-',
                        answer: result - num2
                    };
                    break;
                case 'multiplication':
                    num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20)) + 1;
                    newQuestion = {
                        num1, num2,
                        operator: '×',
                        answer: num1 * num2
                    };
                    break;
                case 'division':
                    num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20)) + 1;
                    newQuestion = {
                        num1: num1 * num2,
                        num2: num1,
                        operator: '÷',
                        answer: num2
                    };
                    break;
            }
        } while (
            lastQuestion &&
            lastQuestion.num1 === newQuestion.num1 &&
            lastQuestion.num2 === newQuestion.num2
        );
  
        lastQuestion = newQuestion;
        return newQuestion;
    }
  
    function startTimer() {
      if (selectedMode !== 'timed') return;
      
      timeLeft = 30;
      timeLeftSpan.textContent = timeLeft;
      timerBar.style.transition = 'none';
      timerBar.style.width = '100%';
      
      setTimeout(() => {
        timerBar.style.transition = 'width linear 30s';
        timerBar.style.width = '0';
      }, 50);
  
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          handleTimeUp();
        }
      }, 1000);
    }
  
    function handleTimeUp() {
      playSound(false);
      emoji.textContent = '⏰';
      resultText.textContent = 'Temps écoulé !';
      result.style.display = 'block';
      stats.errors++;
      streak = 0;
      
      errorHistoryList.push({
        question: `${currentQuestion.num1} ${currentQuestion.operator} ${currentQuestion.num2}`,
        userAnswer: 'Temps écoulé',
        correctAnswer: currentQuestion.answer
      });
      
      updateErrorHistory();
      updateStats();
      
      setTimeout(nextQuestion, 2000);
    }
  
    function stopTimer() {
      clearInterval(timerInterval);
    }
  
    startBtn.addEventListener('click', () => {
        if (selectedTables.length === 0) {
            alert('Veuillez sélectionner au moins un nombre !');
            return;
        }
        if (!selectedOperation) {
            alert('Veuillez sélectionner une opération !');
            return;
        }
        gameArea.style.display = 'block';
        statsDiv.style.display = 'block';
        errorHistory.style.display = 'block';
        result.style.display = 'none';
        stats = { total: 0, success: 0, errors: 0 };
        streak = 0;
        bestStreak = 0;
        errorHistoryList = [];
        updateErrorHistory();
        updateStats();
        nextQuestion();
    });
  
    function updateStats() {
        totalCount.textContent = stats.total;
        successCount.textContent = stats.success;
        errorCount.textContent = stats.errors;
        const rate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
        successRate.textContent = rate;
  
        const streakDisplay = document.querySelector('.streak-display');
        if (streakDisplay) {
            streakDisplay.innerHTML = `
                Série actuelle : <span class="streak">${streak}</span><br>
                Meilleure série : <span class="best-streak">${bestStreak}</span>
            `;
        } else {
            const newStreakDisplay = document.createElement('div');
            newStreakDisplay.className = 'stat-item streak-display';
            newStreakDisplay.innerHTML = `
                Série actuelle : <span class="streak">${streak}</span><br>
                Meilleure série : <span class="best-streak">${bestStreak}</span>
            `;
            statsDiv.querySelector('.stats-container').appendChild(newStreakDisplay);
        }
    }
  
    function updateErrorHistory() {
        errorList.innerHTML = '';
        errorHistoryList.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-item animate__animated animate__fadeIn';
            errorElement.innerHTML = `
                <span class="error-question">${error.question}</span>
                <span class="error-user-answer">Ta réponse : ${error.userAnswer}</span>
                <span class="error-correct-answer">Bonne réponse : ${error.correctAnswer}</span>
            `;
            errorList.appendChild(errorElement);
        });
    }
  
    numButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const [equation, currentValue] = questionDiv.textContent.split('=');
            const newValue = currentValue.trim() === '?' ? btn.textContent : currentValue.trim() + btn.textContent;
            questionDiv.textContent = `${equation}= ${newValue}`;
            btn.classList.add('animate__animated', 'animate__tada');
            setTimeout(() => btn.classList.remove('animate__animated', 'animate__tada'), 500);
        });
    });
  
    clearBtn.addEventListener('click', () => {
        const equation = questionDiv.textContent.split('=')[0];
        questionDiv.textContent = `${equation}= ?`;
        clearBtn.classList.add('animate__animated', 'animate__headShake');
        setTimeout(() => clearBtn.classList.remove('animate__animated', 'animate__headShake'), 500);
    });
  
    validateBtn.addEventListener('click', () => {
      const userAnswer = parseInt(questionDiv.textContent.split('=')[1]);
      result.style.display = 'block';
      stats.total++;
  
      if (selectedMode === 'timed') {
        stopTimer();
      }
  
      if (userAnswer === currentQuestion.answer) {
        stats.success++;
        streak++;
        bestStreak = Math.max(streak, bestStreak);
        playSound(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        emoji.textContent = streak >= 5 ? '🌟' : '🎉';
        resultText.textContent = streak >= 5 ? 'Super série !' : '';
        questionDiv.classList.add('animate__animated', 'animate__bounceIn');
        setTimeout(() => questionDiv.classList.remove('animate__animated', 'animate__bounceIn'), 1000);
        animateProgress(1500);
        setTimeout(nextQuestion, 1500);
      } else {
        stats.errors++;
        streak = 0;
        playSound(false);
        emoji.textContent = '😢';
        resultText.innerHTML = `La bonne réponse était ${currentQuestion.num1} ${currentQuestion.operator} ${currentQuestion.num2} = <span class="correct-answer">${currentQuestion.answer}</span>`;
        questionDiv.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => questionDiv.classList.remove('animate__animated', 'animate__shakeX'), 1000);
  
        errorHistoryList.push({
          question: `${currentQuestion.num1} ${currentQuestion.operator} ${currentQuestion.num2}`,
          userAnswer: userAnswer,
          correctAnswer: currentQuestion.answer
        });
        updateErrorHistory();
  
        animateProgress(3000);
        setTimeout(nextQuestion, 3000);
      }
      updateStats();
    });
  
    function nextQuestion() {
      currentQuestion = generateQuestion();
      if (currentQuestion) {
        questionDiv.textContent = `${currentQuestion.num1} ${currentQuestion.operator} ${currentQuestion.num2} = ?`;
        result.style.display = 'none';
        questionDiv.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => questionDiv.classList.remove('animate__animated', 'animate__fadeIn'), 1000);
        
        if (selectedMode === 'timed') {
          startTimer();
        }
      }
    }
  
    function animateProgress(duration) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.width = '0';
        }, 100);
    }
  
    const errorTitle = errorHistory.querySelector('h2');
    errorList.style.display = 'none';
  
    function updateErrorTitle() {
        const errorCount = errorHistoryList.length;
        const baseText = errorList.style.display === 'none' ? 'Voir mes erreurs' : 'Masquer mes erreurs';
        errorTitle.innerHTML = `${baseText} (${errorCount}) <span class="arrow">▼</span>`;
        errorTitle.classList.toggle('open', errorList.style.display !== 'none');
    }
  
    errorTitle.addEventListener('click', () => {
        errorList.style.display = errorList.style.display === 'none' ? 'block' : 'none';
        updateErrorTitle();
    });
  
    document.addEventListener('keydown', (e) => {
        if (gameArea.style.display === 'none') return;
  
        if (e.key >= '0' && e.key <= '9') {
            const numBtn = Array.from(numButtons).find(btn => btn.textContent === e.key);
            if (numBtn) numBtn.click();
        } else if (e.key === 'Enter') {
            validateBtn.click();
        } else if (e.key === 'Backspace') {
            clearBtn.click();
        }
    });
  });