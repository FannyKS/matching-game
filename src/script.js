class MatchingGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.canFlip = true;
        this.gameOver = false;
        
        // Settings
        this.continueOnMatch = false; // Default: next player even if current player made a match
        
        // Card symbols (pairs)
        this.symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
        
        this.initializeElements();
        this.bindEvents();
        this.showPlayerSetup();
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.messageElement = document.getElementById('message');
        this.playersInfo = document.getElementById('players-info');
        this.currentPlayerElement = document.getElementById('current-player');
        this.scoreboard = document.getElementById('scoreboard');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        
        // Modals
        this.playerSetupModal = document.getElementById('player-setup-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.playerSetupForm = document.getElementById('player-setup-form');
        this.settingsForm = document.getElementById('settings-form');
        this.numPlayersInput = document.getElementById('num-players');
        this.continueOnMatchCheckbox = document.getElementById('continue-on-match');
        this.closeSettingsBtn = document.getElementById('close-settings');
    }
    
    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.showPlayerSetup());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.playerSetupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.setupPlayers(parseInt(this.numPlayersInput.value));
            this.startGame();
        });
        this.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        
        // Close modals when clicking outside
        this.playerSetupModal.addEventListener('click', (e) => {
            if (e.target === this.playerSetupModal) {
                // Don't allow closing setup during active game? But if no game started, maybe
            }
        });
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
    }
    
    showPlayerSetup() {
        this.playerSetupModal.classList.add('active');
    }
    
    hidePlayerSetup() {
        this.playerSetupModal.classList.remove('active');
    }
    
    showSettings() {
        this.continueOnMatchCheckbox.checked = this.continueOnMatch;
        this.settingsModal.classList.add('active');
    }
    
    hideSettings() {
        this.settingsModal.classList.remove('active');
    }
    
    saveSettings() {
        this.continueOnMatch = this.continueOnMatchCheckbox.checked;
        this.hideSettings();
        this.updateDisplay();
        this.showMessage('Settings saved!');
    }
    
    setupPlayers(numPlayers) {
        this.players = [];
        for (let i = 0; i < numPlayers; i++) {
            this.players.push({
                name: `Player ${i + 1}`,
                score: 0
            });
        }
        this.currentPlayerIndex = 0;
    }
    
    startGame() {
        this.hidePlayerSetup();
        this.gameOver = false;
        this.canFlip = true;
        this.flippedCards = [];
        this.matchedCards = [];
        this.cards = [];
        this.scoreboard.classList.add('hidden');
        this.createCards();
        this.shuffleCards();
        this.assignDisplayNumbers();
        this.renderBoard();
        this.updateDisplay();
        this.showMessage(`${this.getCurrentPlayer().name}'s turn`);
    }
    
    createCards() {
        // Create 20 cards (10 pairs)
        const cardSymbols = [...this.symbols];
        // We need exactly 10 pairs = 20 cards
        this.cards = [];
        for (let i = 0; i < 10; i++) {
            const symbol = cardSymbols[i];
            // Create two cards with same symbol
            this.cards.push({
                id: i * 2,
                symbol: symbol,
                matched: false,
                flipped: false,
                removing: false
            });
            this.cards.push({
                id: i * 2 + 1,
                symbol: symbol,
                matched: false,
                flipped: false,
                removing: false
            });
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    assignDisplayNumbers() {
        for (let i = 0; i < this.cards.length; i++) {
            this.cards[i].displayNumber = i + 1;
        }
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.innerHTML = `
                <div class="card-face card-back">${card.displayNumber || card.number}</div>
                <div class="card-face card-front">${card.symbol}</div>
            `;
            cardElement.addEventListener('click', () => this.flipCard(card.id));
            this.gameBoard.appendChild(cardElement);
            
            // Animate card appearance
            setTimeout(() => {
                cardElement.style.animation = 'cardAppear 0.3s ease forwards';
                setTimeout(() => {
                    cardElement.style.animation = '';
                }, 300);
            }, index * 50);
        });
        
        // Add appear animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cardAppear {
                0% {
                    transform: scale(0) rotateY(0deg);
                    opacity: 0;
                }
                100% {
                    transform: scale(1) rotateY(0deg);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    flipCard(cardId) {
        if (!this.canFlip || this.gameOver) return;
        
        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.flipped || card.matched || card.removing) return;
        
        // Flip the card
        card.flipped = true;
        this.flippedCards.push(card);
        this.updateBoard();
        
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    updateBoard() {
        const cardElements = this.gameBoard.querySelectorAll('.card');
        cardElements.forEach(element => {
            const cardId = parseInt(element.dataset.cardId);
            const card = this.cards.find(c => c.id === cardId);
            if (card) {
                if (card.removing) {
                    element.classList.add('removing');
                } else if (card.matched || card.flipped) {
                    element.classList.add('flipped');
                } else {
                    element.classList.remove('flipped');
                }
                if (card.matched) {
                    element.classList.add('matched');
                }
            }
        });
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.symbol === card2.symbol;
        
        if (isMatch) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            this.matchedCards.push(card1, card2);
            this.getCurrentPlayer().score += 1;
            this.showMessage(`Match found! +1 point for ${this.getCurrentPlayer().name}`, 'success');
            
            // Remove cards with animation
            setTimeout(() => {
                card1.removing = true;
                card2.removing = true;
                this.updateBoard();
                this.flippedCards = [];
                this.canFlip = true;
                
                // Check if game is over
                if (this.matchedCards.length === this.cards.length) {
                    this.endGame();
                } else {
                    // Check if current player continues on match
                    if (this.continueOnMatch) {
                        // Same player continues
                        this.showMessage(`${this.getCurrentPlayer().name} gets another turn!`, 'success');
                    } else {
                        // Next player's turn
                        this.nextPlayer();
                    }
                    this.updateDisplay();
                }
            }, 600);
        } else {
            // No match
            card1.flipped = false;
            card2.flipped = false;
            this.showMessage('No match! Try again', 'error');
            
            setTimeout(() => {
                this.flippedCards = [];
                this.canFlip = true;
                this.updateBoard();
                this.nextPlayer();
                this.updateDisplay();
                this.showMessage(`${this.getCurrentPlayer().name}'s turn`);
            }, 600);
        }
    }
    
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    
    updateDisplay() {
        // Update players info
        this.playersInfo.innerHTML = '';
        this.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player' + (index === this.currentPlayerIndex && !this.gameOver ? ' active' : '');
            playerElement.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-score">${player.score}</span>
            `;
            this.playersInfo.appendChild(playerElement);
        });
        
        // Update current player
        if (!this.gameOver && this.players.length > 0) {
            this.currentPlayerElement.textContent = `Current: ${this.getCurrentPlayer().name}`;
        } else {
            this.currentPlayerElement.textContent = '';
        }
    }
    
    showMessage(text, type = '') {
        this.messageElement.textContent = text;
        this.messageElement.className = 'message ' + type;
    }
    
    endGame() {
        this.gameOver = true;
        this.canFlip = false;
        this.updateDisplay();
        this.showScoreboard();
    }
    
    showScoreboard() {
        // Sort players by score (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        const highestScore = sortedPlayers[0].score;
        
        let html = '<h2>Game Over!</h2>';
        sortedPlayers.forEach((player, index) => {
            const isWinner = player.score === highestScore && highestScore > 0;
            html += `
                <div class="scoreboard-item ${isWinner ? 'winner' : ''}">
                    <span>${index + 1}. ${player.name}</span>
                    <span>${player.score} ${player.score === 1 ? 'point' : 'points'}</span>
                </div>
            `;
        });
        
        if (highestScore === 0) {
            html += '<p>No one scored any points!</p>';
        }
        
        this.scoreboard.innerHTML = html;
        this.scoreboard.classList.remove('hidden');
        this.showMessage('Game Over! Check the scoreboard below.');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MatchingGame();
});