const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_ICONS = { h: '♥', d: '♦', c: '♣', s: '♠' };

let deck = [];
let score = 0;
let time = 0;
let timerInterval;

function createDeck() {
    const newDeck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            newDeck.push({ suit, rank, isFaceUp: false });
        }
    }
    return newDeck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.classList.add('card');
    if (!card.isFaceUp) {
        el.classList.add('back');
        return el;
    }

    el.classList.add(card.suit === 'h' || card.suit === 'd' ? 'red' : 'black');
    el.innerHTML = `
        <div class="rank">${card.rank}</div>
        <div class="suit">${SUIT_ICONS[card.suit]}</div>
    `;
    return el;
}

function initGame() {
    deck = createDeck();
    shuffle(deck);

    // Clear elements
    document.querySelectorAll('.tableau-column').forEach(col => col.innerHTML = '');
    document.getElementById('waste').innerHTML = '';
    document.getElementById('deck').innerHTML = '';
    document.querySelectorAll('.foundation').forEach(f => f.innerHTML = '');

    // Deal tableau
    for (let i = 0; i < 7; i++) {
        const col = document.getElementById(`t${i}`);
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            if (j === i) card.isFaceUp = true;
            const cardEl = createCardElement(card);
            cardEl.style.top = `${j * 25}px`;
            col.appendChild(cardEl);
        }
    }

    // Put remaining in deck
    const deckEl = document.getElementById('deck');
    const backEl = document.createElement('div');
    backEl.classList.add('card', 'back');
    deckEl.appendChild(backEl);

    score = 0;
    time = 0;
    updateStats();
    startTimer();
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = time;
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time++;
        updateStats();
    }, 1000);
}

document.getElementById('new-game-btn').addEventListener('click', initGame);

// Initial start
initGame();

// Note: This is a simplified visual representation.
// A full Solitaire implementation with drag-and-drop and complete logic
// would be much larger. This provides the UI and basic dealing logic.
