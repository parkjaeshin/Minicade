/**
 * Arknights: Endfield Circuit Repair Game Logic
 */

const GRID_SIZE = 5;
let grid = [];
let inventory = {
    'I': 5,
    'L': 5,
    'T': 3,
    'X': 2
};
let selectedPieceType = null;
let currentLevel = {
    source: { x: 0, y: 2 },
    nodes: [
        { x: 4, y: 0 },
        { x: 4, y: 4 },
        { x: 2, y: 4 }
    ],
    blocked: [
        { x: 1, y: 1 },
        { x: 3, y: 3 }
    ]
};

// Shape definitions: [top, right, bottom, left] connections
const SHAPES = {
    'I': [true, false, true, false],
    'L': [true, true, false, false],
    'T': [false, true, true, true],
    'X': [true, true, true, true]
};

/**
 * Initialize the game
 */
function init() {
    createGrid();
    renderInventory();
    setupEventListeners();
    updateCircuit();
}

/**
 * Create the grid structure
 */
function createGrid() {
    const gridEl = document.getElementById('circuit-grid');
    gridEl.innerHTML = '';

    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const cellState = {
                x, y,
                type: 'empty', // empty, source, node, blocked, piece
                piece: null,   // { type, rotation }
                active: false
            };

            // Set special cell types
            if (currentLevel.source.x === x && currentLevel.source.y === y) {
                cellState.type = 'source';
                cell.classList.add('source');
                const core = document.createElement('div');
                core.className = 'source-core';
                cell.appendChild(core);
            } else if (currentLevel.nodes.some(n => n.x === x && n.y === y)) {
                cellState.type = 'node';
                cell.classList.add('node');
                const core = document.createElement('div');
                core.className = 'node-core';
                cell.appendChild(core);
            } else if (currentLevel.blocked.some(b => b.x === x && b.y === y)) {
                cellState.type = 'blocked';
                cell.classList.add('blocked');
            }

            grid[y][x] = cellState;
            cell.addEventListener('click', () => handleCellClick(x, y));
            gridEl.appendChild(cell);
        }
    }
}

/**
 * Handle clicking on a cell
 */
function handleCellClick(x, y) {
    const cellState = grid[y][x];
    const cellEl = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

    if (cellState.type === 'blocked' || cellState.type === 'source') return;

    if (cellState.piece) {
        // Rotate existing piece
        cellState.piece.rotation = (cellState.piece.rotation + 90) % 360;
        updatePieceVisual(cellEl, cellState.piece);
    } else if (selectedPieceType && inventory[selectedPieceType] > 0) {
        // Place new piece
        cellState.piece = {
            type: selectedPieceType,
            rotation: 0
        };
        inventory[selectedPieceType]--;
        renderInventory();

        // Visuals
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece shape-${selectedPieceType}`;

        // Create lines based on shape
        if (selectedPieceType === 'I' || selectedPieceType === 'X') {
            const v = document.createElement('div'); v.className = 'circuit-line line-v'; pieceEl.appendChild(v);
        }
        if (selectedPieceType === 'L' || selectedPieceType === 'T' || selectedPieceType === 'X') {
            const h = document.createElement('div'); h.className = 'circuit-line line-h'; pieceEl.appendChild(h);
        }
        if (selectedPieceType === 'L' || selectedPieceType === 'T') {
            const v = document.createElement('div'); v.className = 'circuit-line line-v'; pieceEl.appendChild(v);
        }

        cellEl.appendChild(pieceEl);
        cellState.type = cellState.type === 'node' ? 'node' : 'piece';
    }

    updateCircuit();
}

function updatePieceVisual(cellEl, piece) {
    const pieceEl = cellEl.querySelector('.piece');
    if (pieceEl) {
        pieceEl.style.transform = `rotate(${piece.rotation}deg)`;
    }
}

/**
 * Update the whole circuit state (Power flow)
 */
function updateCircuit() {
    // Reset all activities
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x].active = false;
        }
    }

    // BFS for power flow
    const queue = [currentLevel.source];
    grid[currentLevel.source.y][currentLevel.source.x].active = true;

    let head = 0;
    while (head < queue.length) {
        const current = queue[head++];
        const neighbors = getConnectedNeighbors(current.x, current.y);

        for (const neighbor of neighbors) {
            if (!grid[neighbor.y][neighbor.x].active) {
                grid[neighbor.y][neighbor.x].active = true;
                queue.push(neighbor);
            }
        }
    }

    // Update visuals
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const cellEl = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if (grid[y][x].active) {
                cellEl.classList.add('active');
            } else {
                cellEl.classList.remove('active');
            }
        }
    }

    checkVictory();
}

/**
 * Get neighbors that are physically connected via circuit
 */
function getConnectedNeighbors(x, y) {
    const connections = getCellConnections(x, y);
    const neighbors = [];

    // Check North
    if (connections[0] && y > 0) {
        const northConnections = getCellConnections(x, y - 1);
        if (northConnections[2]) neighbors.push({ x, y: y - 1 });
    }
    // Check East
    if (connections[1] && x < GRID_SIZE - 1) {
        const eastConnections = getCellConnections(x + 1, y);
        if (eastConnections[3]) neighbors.push({ x: x + 1, y });
    }
    // Check South
    if (connections[2] && y < GRID_SIZE - 1) {
        const southConnections = getCellConnections(x, y + 1);
        if (southConnections[0]) neighbors.push({ x, y: y + 1 });
    }
    // Check West
    if (connections[3] && x > 0) {
        const westConnections = getCellConnections(x - 1, y);
        if (westConnections[1]) neighbors.push({ x: x - 1, y });
    }

    return neighbors;
}

/**
 * Returns [top, right, bottom, left] booleans for a cell
 */
function getCellConnections(x, y) {
    const cell = grid[y][x];
    if (cell.type === 'source') return [true, true, true, true]; // Source connects all sides
    if (cell.type === 'blocked' || (!cell.piece && cell.type !== 'node')) return [false, false, false, false];

    // Nodes don't have built-in connections, they wait for input
    if (cell.type === 'node' && !cell.piece) return [true, true, true, true];

    const base = SHAPES[cell.piece.type];
    const rotated = [...base];
    const rotCount = (cell.piece.rotation / 90) % 4;

    for (let i = 0; i < rotCount; i++) {
        rotated.unshift(rotated.pop());
    }

    return rotated;
}

/**
 * Render inventory UI
 */
function renderInventory() {
    const invEl = document.getElementById('piece-inventory');
    invEl.innerHTML = '';

    for (const [type, count] of Object.entries(inventory)) {
        const item = document.createElement('div');
        item.className = `inv-item ${selectedPieceType === type ? 'selected' : ''}`;
        item.dataset.type = type;

        const pieceDisplay = document.createElement('div');
        pieceDisplay.className = `piece shape-${type}`;

        // Simple visual for inventory pieces
        if (type === 'I' || type === 'X') {
            const v = document.createElement('div'); v.className = 'circuit-line line-v'; pieceDisplay.appendChild(v);
        }
        if (type === 'L' || type === 'T' || type === 'X') {
            const h = document.createElement('div'); h.className = 'circuit-line line-h'; pieceDisplay.appendChild(h);
        }
        if (type === 'L' || type === 'T') {
            const v = document.createElement('div'); v.className = 'circuit-line line-v'; pieceDisplay.appendChild(v);
        }

        item.appendChild(pieceDisplay);

        const countEl = document.createElement('span');
        countEl.className = 'piece-count';
        countEl.innerText = `x${count}`;
        item.appendChild(countEl);

        item.addEventListener('click', () => {
            selectedPieceType = type;
            renderInventory();
        });

        invEl.appendChild(item);
    }
}

function setupEventListeners() {
    document.getElementById('reset-btn').addEventListener('click', () => {
        location.reload();
    });
}

function checkVictory() {
    const allNodesActive = currentLevel.nodes.every(n => grid[n.y][n.x].active);
    if (allNodesActive) {
        setTimeout(() => {
            document.getElementById('victory-modal').style.display = 'flex';
        }, 500);
    }
}

window.onload = init;
