document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const gameContainer = document.getElementById('game-container');
    const playButtons = document.querySelectorAll('.play-btn');
    const miniGames = document.querySelectorAll('.mini-game');

    // Gestion du thème
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    function showCelebration(emoji) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.textContent = emoji;
        document.body.appendChild(celebration);
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    
        setTimeout(() => {
            document.body.removeChild(celebration);
        }, 1000);
    }

    // Gestion des jeux
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            document.querySelector('.games-grid').style.display = 'none';
            gameContainer.style.display = 'block';
            
            miniGames.forEach(g => g.style.display = 'none');
            
            switch(game) {
                case 'memory':
                    initMemoryGame();
                    break;
                case 'rush':
                    initNumberRush();
                    break;
                case 'puzzle':
                    initMathPuzzle();
                    break;
            }
        });
    });

    // Memory Game
    function initMemoryGame() {
        const memoryGame = document.getElementById('memory-game');
        const memoryGrid = memoryGame.querySelector('.memory-grid');
        const pairsFound = document.getElementById('pairs-found');
        const memoryTimer = document.getElementById('memory-timer');
        let timeElapsed = 0;
        let timerInterval;
        let flippedCards = [];
        let matchedPairs = 0;

        memoryGame.style.display = 'block';

        // Créer les paires d'opérations
        const operations = [
            { op: '2 + 3', result: 5 },
            { op: '10 - 5', result: 5 },
            { op: '3 × 2', result: 6 },
            { op: '12 ÷ 2', result: 6 },
            { op: '4 + 4', result: 8 },
            { op: '2 × 4', result: 8 },
            { op: '15 - 5', result: 10 },
            { op: '2 × 5', result: 10 }
        ];

        const cards = [...operations, ...operations.map(op => ({ op: op.result.toString(), result: op.result }))];
        shuffleArray(cards);

        // Créer la grille
        memoryGrid.innerHTML = '';
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.innerHTML = `
                <div class="front">?</div>
                <div class="back">${card.op}</div>
            `;
            cardElement.dataset.index = index;
            cardElement.dataset.result = card.result;
            
            cardElement.addEventListener('click', () => flipCard(cardElement));
            memoryGrid.appendChild(cardElement);
        });

        // Démarrer le timer
        timerInterval = setInterval(() => {
            timeElapsed++;
            memoryTimer.textContent = timeElapsed;
        }, 1000);

        function flipCard(card) {
            if (flippedCards.length === 2 || card.classList.contains('flipped') || 
                card.classList.contains('matched')) return;

            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                checkMatch();
            }
        }

        function checkMatch() {
            const [card1, card2] = flippedCards;
            const match = card1.dataset.result === card2.dataset.result;
        
            if (match) {
                card1.classList.add('matched', 'success-animation');
                card2.classList.add('matched', 'success-animation');
                matchedPairs++;
                pairsFound.textContent = matchedPairs;
                showCelebration('🌟');
        
                if (matchedPairs === 8) {
                    clearInterval(timerInterval);
                    setTimeout(() => {
                        showCelebration('🏆');
                        alert(`Félicitations ! Tu as terminé en ${timeElapsed} secondes !`);
                        resetMemoryGame();
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                }, 1000);
            }
        
            flippedCards = [];
        }
    }

    // Number Rush
    function initNumberRush() {
        const numberRush = document.getElementById('number-rush');
        const numberContainer = numberRush.querySelector('.number-container');
        const rushScore = document.getElementById('rush-score');
        const rushTimer = document.getElementById('rush-timer');
        let score = 0;
        let timeLeft = 60;
        let timerInterval;
        let currentNumbers = [];
        let selectedNumbers = [];

        numberRush.style.display = 'block';

        function generateNumbers() {
            currentNumbers = Array.from({length: 8}, () => Math.floor(Math.random() * 100));
            selectedNumbers = [];
            
            numberContainer.innerHTML = '';
            shuffleArray(currentNumbers).forEach(num => {
                const tile = document.createElement('div');
                tile.className = 'number-tile';
                tile.textContent = num;
                tile.addEventListener('click', () => selectNumber(tile, num));
                numberContainer.appendChild(tile);
            });
        }

        function selectNumber(tile, num) {
            if (tile.classList.contains('correct')) return;
        
            const expectedNumber = Math.min(...currentNumbers.filter(n => !selectedNumbers.includes(n)));
            
            if (num === expectedNumber) {
                tile.classList.add('correct', 'success-animation');
                selectedNumbers.push(num);
                score += 10;
                rushScore.textContent = score;
                showCelebration('✨');
        
                if (selectedNumbers.length === currentNumbers.length) {
                    showCelebration('🎯');
                    generateNumbers();
                }
            } else {
                score = Math.max(0, score - 5);
                rushScore.textContent = score;
                tile.classList.add('animate__animated', 'animate__shakeX');
                setTimeout(() => tile.classList.remove('animate__animated', 'animate__shakeX'), 500);
            }
        }

        timerInterval = setInterval(() => {
            timeLeft--;
            rushTimer.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert(`Temps écoulé ! Score final : ${score}`);
                resetNumberRush();
            }
        }, 1000);

        generateNumbers();
    }

    // Math Puzzle
    function initMathPuzzle() {
        const mathPuzzle = document.getElementById('math-puzzle');
        const puzzleGrid = mathPuzzle.querySelector('.puzzle-grid');
        const puzzleLevel = document.getElementById('puzzle-level');
        let currentLevel = 1;

        mathPuzzle.style.display = 'block';

        function generatePuzzle() {
            const puzzle = [];
            const size = 3;
            
            // Générer une grille valide
            for (let i = 0; i < size; i++) {
                puzzle[i] = [];
                for (let j = 0; j < size; j++) {
                    puzzle[i][j] = Math.floor(Math.random() * 9) + 1;
                }
            }

            // Cacher certains nombres
            const hiddenCells = Math.min(3 + currentLevel, 7);
            const positions = shuffleArray(Array.from({length: 9}, (_, i) => i)).slice(0, hiddenCells);

            puzzleGrid.innerHTML = '';
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'puzzle-cell';
                    const index = i * size + j;

                    if (positions.includes(index)) {
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = '1';
                        input.max = '9';
                        input.dataset.row = i;
                        input.dataset.col = j;
                        input.dataset.correct = puzzle[i][j];
                        input.addEventListener('input', checkPuzzle);
                        cell.appendChild(input);
                    } else {
                        cell.textContent = puzzle[i][j];
                    }

                    puzzleGrid.appendChild(cell);
                }
            }
        }

        function checkPuzzle() {
            const inputs = puzzleGrid.querySelectorAll('input');
            let allCorrect = true;
        
            inputs.forEach(input => {
                const value = parseInt(input.value);
                const correct = parseInt(input.dataset.correct);
        
                if (value === correct) {
                    input.style.color = 'var(--success-color)';
                    input.classList.add('success-animation');
                } else {
                    input.style.color = 'var(--error-color)';
                    input.classList.remove('success-animation');
                    allCorrect = false;
                }
            });
        
            if (allCorrect && inputs.length > 0) {
                showCelebration('🧩');
                setTimeout(() => {
                    alert(`Bravo ! Tu as complété le niveau ${currentLevel} !`);
                    currentLevel++;
                    puzzleLevel.textContent = currentLevel;
                    generatePuzzle();
                }, 500);
            }
        }

        generatePuzzle();
    }

    // Utilitaires
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function resetMemoryGame() {
        document.querySelector('.games-grid').style.display = 'grid';
        gameContainer.style.display = 'none';
        document.getElementById('memory-game').style.display = 'none';
    }

    function resetNumberRush() {
        document.querySelector('.games-grid').style.display = 'grid';
        gameContainer.style.display = 'none';
        document.getElementById('number-rush').style.display = 'none';
    }
});