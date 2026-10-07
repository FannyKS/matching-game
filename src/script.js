class MatchingGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedCards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.canFlip = true;
        this.gameOver = false;
        this.gameStarted = false;

        // Ids of the delayed callbacks scheduled by flipCard/checkMatch. They
        // are cancelled when a new game starts; see scheduleLater().
        this.pendingTimers = new Set();
        
        // Settings
        this.continueOnMatch = false; // Default: next player even if current player made a match
        
        // Card symbols (pairs)
        this.symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];
        
        // Deck selection: the emoji set, folders recorded in games.js, and
        // folders discovered live through the File System Access API.
        this.emojiDeck = { id: 'emoji', name: 'Classic Emojis', emoji: true };
        this.manifestDecks = [];
        this.liveDecks = [];
        this.selectedDeck = null;
        this.pairsPerGame = 10; // Games always deal this.pairsPerGame * 2 cards
        
        this.initializeElements();
        this.loadDecks();
        this.bindEvents();
        this.showDeckPicker();
        
        // Re-scan the remembered folder without prompting, so a plain browser
        // reload is enough to notice images added since the last visit.
        this.restoreSavedFolder();
    }
    
    static get IMAGE_EXTENSIONS() {
        return /\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)$/i;
    }
    
    // Alt text: drop every trailing extension ("photo.jpg.webp" -> "photo") and
    // collapse runs of whitespace. Mirrors the rule in tools/generate_games.sh.
    static labelFromFilename(filename) {
        return filename
            .replace(/(\.[^.]*)+$/, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    loadDecks() {
        // games.js is generated from the folders under "Image Resources". It is
        // the fallback for browsers without the File System Access API, and it
        // still works from file:// where scanning is unavailable.
        const folders = Array.isArray(window.GAMES) ? window.GAMES : [];
        this.manifestDecks = folders;
    }
    
    allDecks() {
        // Live-scanned folders win over the recorded ones with the same name.
        const byName = new Map();
        this.manifestDecks.forEach(deck => byName.set(deck.name, deck));
        this.liveDecks.forEach(deck => byName.set(deck.name, deck));
        
        const folders = [...byName.values()].sort(
            (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        return [this.emojiDeck, ...folders];
    }
    
    scanSupported() {
        return typeof window.showDirectoryPicker === 'function';
    }
    
    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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
        this.deckModal = document.getElementById('deck-modal');
        this.deckList = document.getElementById('deck-list');
        this.closeDeckBtn = document.getElementById('close-deck');
        this.deckScan = document.getElementById('deck-scan');
        this.scanFolderBtn = document.getElementById('scan-folder-btn');
        this.reconnectFolderBtn = document.getElementById('reconnect-folder-btn');
        this.forgetFolderBtn = document.getElementById('forget-folder-btn');
        this.scanStatus = document.getElementById('scan-status');
        this.needsReconnect = null; // Remembered folder still awaiting permission
        this.playerSetupModal = document.getElementById('player-setup-modal');
        this.settingsModal = document.getElementById('settings-modal');
        this.playerSetupForm = document.getElementById('player-setup-form');
        this.settingsForm = document.getElementById('settings-form');
        this.numPlayersInput = document.getElementById('num-players');
        this.playerSetupDeck = document.getElementById('player-setup-deck');
        this.continueOnMatchCheckbox = document.getElementById('continue-on-match');
        this.closeSettingsBtn = document.getElementById('close-settings');
    }
    
    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.showDeckPicker());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeDeckBtn.addEventListener('click', () => this.hideDeckPicker());
        this.scanFolderBtn.addEventListener('click', () => this.scanFolder());
        this.reconnectFolderBtn.addEventListener('click', () => this.reconnectFolder());
        this.forgetFolderBtn.addEventListener('click', () => this.forgetFolder());
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
        this.deckModal.addEventListener('click', (e) => {
            // Only dismissible once a game exists, so the first pick is required
            if (e.target === this.deckModal && this.gameStarted) {
                this.hideDeckPicker();
            }
        });
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
    }
    
    showDeckPicker() {
        // The scan controls only appear where the API exists (Chromium browsers).
        this.deckScan.classList.toggle('hidden', !this.scanSupported());
        this.renderDeckList();
        this.updateFolderButtons();
        this.closeDeckBtn.classList.toggle('hidden', !this.gameStarted);
        this.deckModal.classList.add('active');
    }
    
    hideDeckPicker() {
        this.deckModal.classList.remove('active');
    }
    
    renderDeckList() {
        this.deckList.innerHTML = '';
        const decks = this.allDecks();
        
        if (decks.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'deck-empty';
            empty.textContent = 'No games available.';
            this.deckList.appendChild(empty);
            return;
        }
        
        decks.forEach(deck => {
            // Folders with no images are still listed so the picker mirrors the
            // folders on disk, but they cannot start a game.
            const playable = this.isDeckPlayable(deck);
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'deck-item';
            if (!playable) item.classList.add('empty');
            if (this.selectedDeck && this.selectedDeck.id === deck.id) {
                item.classList.add('selected');
            }
            if (deck.live) item.classList.add('live');
            item.disabled = !playable;
            item.innerHTML = `
                <span class="deck-name">${this.escapeHtml(deck.name)}${deck.live ? '<span class="deck-badge">live</span>' : ''}</span>
                <span class="deck-meta">${this.escapeHtml(this.getDeckSummary(deck))}</span>
                <span class="deck-preview">${this.renderDeckPreview(deck)}</span>
            `;
            if (playable) {
                item.addEventListener('click', () => this.selectDeck(deck));
            }
            this.deckList.appendChild(item);
        });
    }
    
    isDeckPlayable(deck) {
        return Boolean(deck.emoji || deck.images.length > 0);
    }
    
    getDeckSummary(deck) {
        if (deck.emoji) {
            return `${this.symbols.length} symbols - ${this.symbols.length} pairs`;
        }
        if (!this.isDeckPlayable(deck)) {
            return 'No images';
        }
        return `${deck.images.length} images - ${deck.pairCount} pairs`;
    }
    
    renderDeckPreview(deck) {
        // One cover image per folder, so the deck is recognisable at a glance.
        // Purely decorative; the folder name beside it carries the meaning.
        if (deck.emoji) {
            return `<span class="deck-preview-face">${this.symbols[0]}</span>`;
        }
        if (!this.isDeckPlayable(deck)) {
            return '<span class="deck-preview-blank"></span>';
        }
        const cover = deck.images[0];
        return `<img class="deck-preview-face" src="${this.escapeHtml(cover.src)}" alt="" loading="lazy" draggable="false">`;
    }
    
    // ---------------------------------------------------------------------
    // Live folder scanning (File System Access API, Chromium browsers only)
    // ---------------------------------------------------------------------
    
    async scanFolder() {
        this.setScanStatus('Choose the &quot;Image Resources&quot; folder…');
        
        let dirHandle;
        try {
            // Must be called directly from a click, so it cannot be moved into
            // a helper without the browser treating it as stale.
            dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        } catch (error) {
            if (error && error.name === 'AbortError') {
                this.setScanStatus('Cancelled.');
            } else {
                this.setScanStatus('Could not open that folder.');
                this.warn(error);
            }
            return;
        }
        
        this.setScanStatus('Scanning…');
        
        // Remember it so a reload can skip the dialog next time.
        await this.saveFolderHandle(dirHandle);
        
        // scanInto() populates liveDecks, so the button states can only be
        // worked out once it has finished.
        await this.scanInto(dirHandle);
        this.updateFolderButtons();
    }
    
    async scanInto(dirHandle) {
        try {
            const decks = await this.readDecksFromDirectory(dirHandle);
            this.liveDecks = decks;
            this.renderDeckList();
            
            const imageCount = decks.reduce((total, deck) => total + deck.images.length, 0);
            this.setScanStatus(decks.length
                ? `Live from <strong>${this.escapeHtml(dirHandle.name)}</strong> &mdash; ${decks.length} folder(s), ${imageCount} image(s). Reload to refresh.`
                : `No image folders inside ${this.escapeHtml(dirHandle.name)}`);
        } catch (error) {
            this.setScanStatus('Failed to read that folder.');
            this.warn(error);
        }
    }
    
    // Called on every load. If we still hold read permission for the folder the
    // user picked before, re-scan it quietly; otherwise offer to reconnect.
    async restoreSavedFolder() {
        if (!this.scanSupported()) return;
        
        const dirHandle = await this.readFolderHandle();
        if (!dirHandle) return;
        
        // The handle can outlive the permission grant, so confirm before reading.
        if (typeof dirHandle.queryPermission === 'function') {
            let state;
            try {
                state = await dirHandle.queryPermission({ mode: 'read' });
            } catch (error) {
                state = 'denied';
            }
            if (state !== 'granted') {
                this.needsReconnect = dirHandle;
                this.setScanStatus(`Click Reconnect to refresh from <strong>${this.escapeHtml(dirHandle.name)}</strong>.`);
                this.updateFolderButtons();
                return;
            }
        }
        
        await this.scanInto(dirHandle);
        this.updateFolderButtons();
    }
    
    async reconnectFolder() {
        const dirHandle = this.needsReconnect;
        if (!dirHandle) return;
        
        this.setScanStatus('Waiting for permission…');
        try {
            // Must stay inside the click handler for the gesture to count.
            const state = await dirHandle.requestPermission({ mode: 'read' });
            if (state !== 'granted') {
                this.setScanStatus('Permission declined.');
                return;
            }
        } catch (error) {
            this.setScanStatus('Could not get permission for that folder.');
            this.warn(error);
            return;
        }
        
        this.needsReconnect = null;
        await this.scanInto(dirHandle);
        this.updateFolderButtons();
    }
    
    async forgetFolder() {
        await this.deleteFolderHandle();
        this.needsReconnect = null;
        this.liveDecks = [];
        this.renderDeckList();
        this.updateFolderButtons();
        this.setScanStatus('Folder forgotten. Scan a folder to connect again.');
    }
    
    // "Reconnect" only while a remembered folder is waiting on permission.
    // "Forget" only once we actually hold one.
    updateFolderButtons() {
        this.reconnectFolderBtn.classList.toggle('hidden', !this.needsReconnect);
        this.forgetFolderBtn.classList.toggle('hidden', !this.needsReconnect && this.liveDecks.length === 0);
    }
    
    setScanStatus(html) {
        this.scanStatus.innerHTML = html;
    }
    
    // ---------------------------------------------------------------------
    // Remembering the folder between visits
    //
    // A FileSystemDirectoryHandle can be stored in IndexedDB and structured-
    // cloned back out. Chrome then treats read access as still granted, which
    // is what lets a reload re-scan without the user re-picking the folder.
    // ---------------------------------------------------------------------
    
    openFolderDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('matching-game-decks', 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains('folders')) {
                    request.result.createObjectStore('folders');
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async withFolderStore(mode, action) {
        const db = await this.openFolderDb();
        try {
            return await new Promise((resolve, reject) => {
                const tx = db.transaction('folders', mode);
                const request = action(tx.objectStore('folders'));
                tx.oncomplete = () => resolve(request.result);
                tx.onerror = () => reject(tx.error);
                tx.onabort = () => reject(tx.error);
            });
        } finally {
            db.close();
        }
    }
    
    // Remembering a folder is a convenience, never a prerequisite: if storage is
    // unavailable (private browsing, a blocked origin, no console) the scan must
    // still succeed, it just will not survive a reload. So these helpers swallow
    // every failure, including failures raised while reporting one.
    warn(...args) {
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            console.warn(...args);
        }
    }
    
    async saveFolderHandle(dirHandle) {
        try {
            await this.withFolderStore('readwrite', store => store.put(dirHandle, 'image-resources'));
        } catch (error) {
            this.warn('Could not remember the folder:', error);
        }
    }
    
    async readFolderHandle() {
        try {
            return (await this.withFolderStore('readonly', store => store.get('image-resources'))) || null;
        } catch (error) {
            return null;
        }
    }
    
    async deleteFolderHandle() {
        try {
            await this.withFolderStore('readwrite', store => store.delete('image-resources'));
        } catch (error) {
            this.warn('Could not forget the folder:', error);
        }
    }
    
    async readDecksFromDirectory(dirHandle) {
        const decks = [];
        
        for await (const [name, handle] of dirHandle.entries()) {
            if (handle.kind !== 'directory') continue;
            if (name.startsWith('.')) continue;
            decks.push(await this.readDeckFromDirectory(name, handle));
        }
        
        decks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        return decks;
    }
    
    async readDeckFromDirectory(name, dirHandle) {
        const images = [];
        
        for await (const [fileName, fileHandle] of dirHandle.entries()) {
            if (fileHandle.kind !== 'file') continue;
            if (fileName.startsWith('.')) continue;
            if (!MatchingGame.IMAGE_EXTENSIONS.test(fileName)) continue;
            
            const file = await fileHandle.getFile();
            // Blob URLs are intentionally not revoked: the cards still reference
            // them for the rest of the session. A handful of small images is not
            // worth the risk of blanking a board mid-game.
            images.push({
                src: URL.createObjectURL(file),
                label: MatchingGame.labelFromFilename(fileName),
                filename: fileName,
            });
        }
        
        return {
            id: `live:${name}`,
            name: name,
            emoji: false,
            live: true,
            pairCount: Math.floor(images.length / 2),
            images: images,
        };
    }
    
    selectDeck(deck) {
        this.selectedDeck = deck;
        this.hideDeckPicker();
        this.playerSetupDeck.textContent = `Deck: ${deck.name}`;
        this.showPlayerSetup();
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
    
    // setTimeout that records its own id, so a restart can drop it. The bare
    // setTimeout calls in flipCard/checkMatch outlived the game that created
    // them: restarting inside the 1000ms or 600ms window let checkMatch run
    // against the new board, where this.flippedCards is empty, so the
    // destructuring threw a TypeError and left canFlip stuck at false.
    scheduleLater(fn, delay) {
        const id = setTimeout(() => {
            this.pendingTimers.delete(id);
            fn();
        }, delay);
        this.pendingTimers.add(id);
        return id;
    }
    
    // Drop every delayed callback still queued. Called before a new board is
    // built, so nothing from the previous game can touch the new one.
    cancelPendingTimers() {
        this.pendingTimers.forEach(id => clearTimeout(id));
        this.pendingTimers.clear();
    }
    
    startGame() {
        if (!this.selectedDeck) {
            this.showDeckPicker();
            return;
        }
        
        this.cancelPendingTimers();
        this.hidePlayerSetup();
        this.gameOver = false;
        this.gameStarted = true;
        this.canFlip = true;
        this.flippedCards = [];
        this.matchedCards = [];
        this.cards = [];
        this.scoreboard.classList.add('hidden');
        this.createCards();
        if (this.cards.length === 0) {
            // Defensive: a folder with no images cannot produce a board
            this.showMessage(`${this.selectedDeck.name} has no images to play with`, 'error');
            this.showDeckPicker();
            return;
        }
        this.shuffleCards();
        this.assignDisplayNumbers();
        this.renderBoard();
        this.updateDisplay();
        
        if (this.cards.length < this.pairsPerGame * 2) {
            // Only reachable for folders holding fewer images than a full game needs
            const distinct = new Set(this.cards.map(card => card.symbol)).size;
            this.showMessage(`Small deck: ${this.selectedDeck.name} has only ${distinct} image(s), so this board has ${this.cards.length} cards`, 'error');
        } else {
            this.showMessage(`${this.getCurrentPlayer().name}'s turn`);
        }
    }
    
    buildPairList() {
        const deck = this.selectedDeck;
        if (!deck) return [];
        
        // `symbol` doubles as the match key: an emoji, or the image src for
        // image decks. That keeps checkMatch() working for both deck types.
        if (deck.emoji) {
            return this.symbols.slice(0, this.pairsPerGame).map(symbol => [
                { symbol: symbol, image: null, label: symbol },
                { symbol: symbol, image: null, label: symbol }
            ]);
        }
        
        // One pair per distinct image, so each image is dealt twice. Shuffle
        // first: a folder holding more images than a game needs then deals a
        // different subset each time instead of always the same first ten.
        const order = deck.images.map((image, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        
        const basePairs = order.map(index => {
            const image = deck.images[index];
            const face = { symbol: image.src, image: image.src, label: image.label };
            return [face, face];
        });
        if (basePairs.length === 0) return [];
        
        // Games always deal pairsPerGame pairs, so extra images are set aside.
        const pairs = basePairs.slice(0, this.pairsPerGame);
        if (pairs.length === this.pairsPerGame) return pairs;
        
        // Too few images to fill the board: deal what exists, then repeat pairs
        // to get closer. Each pair is used at most twice, which caps an image at
        // four cards. Four identical cards are safe -- they resolve as two
        // independent matches. Every image keeps an even count, so the game
        // always reaches a finish rather than stranding cards.
        const timesUsed = new Map();
        pairs.forEach(pair => timesUsed.set(pair, 1));
        let madeProgress = true;
        
        while (pairs.length < this.pairsPerGame && madeProgress) {
            madeProgress = false;
            for (const pair of basePairs) {
                if (pairs.length >= this.pairsPerGame) break;
                if ((timesUsed.get(pair) || 0) < 2) {
                    timesUsed.set(pair, (timesUsed.get(pair) || 0) + 1);
                    pairs.push(pair);
                    madeProgress = true;
                }
            }
        }
        
        return pairs;
    }
    
    createCards() {
        this.cards = [];
        let nextId = 0;
        
        this.buildPairList().forEach(pair => {
            pair.forEach(face => {
                this.cards.push({
                    id: nextId++,
                    symbol: face.symbol,
                    image: face.image,
                    label: face.label,
                    matched: false,
                    flipped: false,
                    removing: false
                });
            });
        });
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
                <div class="card-face card-front">${this.renderCardFace(card)}</div>
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
    
    renderCardFace(card) {
        if (card.image) {
            // The name is written on the card face rather than left only in the
            // alt text, so a revealed photo teaches the player what it shows.
            // It rides on the face itself, which is why it appears on reveal and
            // not while the card is face-down.
            const label = this.escapeHtml(card.label);
            return `<img class="card-image" src="${this.escapeHtml(card.image)}" alt="${label}" draggable="false">` +
                `<span class="card-label">${label}</span>`;
        }
        return this.escapeHtml(card.symbol);
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
            this.scheduleLater(() => this.checkMatch(), 1000);
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
        // Belt and braces alongside cancelPendingTimers(): if this is ever
        // reached without a live pair, release the lock and wait for the next
        // real turn rather than throwing and freezing the board.
        if (!card1 || !card2) {
            this.flippedCards = [];
            this.canFlip = true;
            return;
        }
        const isMatch = card1.symbol === card2.symbol;
        
        if (isMatch) {
            // Match found
            card1.matched = true;
            card2.matched = true;
            this.matchedCards.push(card1, card2);
            this.getCurrentPlayer().score += 1;
            this.showMessage(`Match found! +1 point for ${this.getCurrentPlayer().name}`, 'success');
            
            // Remove cards with animation
            this.scheduleLater(() => {
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
            
            this.scheduleLater(() => {
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