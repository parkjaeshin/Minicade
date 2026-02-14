/**
 * Block Placement Game Logic (V2 - Cleaned & Snapped)
 */

// Configuration
const GRID_SIZE = 50;

function setupGlobalEvents() {
    const spawnBtn = document.getElementById('spawn-btn');
    if (spawnBtn) {
        spawnBtn.addEventListener('click', spawnDraggableObject);
    }

    // Add global drag listeners
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // Mouse Position Tracker
    document.addEventListener('mousemove', (e) => {
        const status = document.getElementById('mouse-status');
        if (status) {
            status.textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
        }
    });
}

// Free Drag Logic
let currentDragObject = null;
let dragOffset = { x: 0, y: 0 };

function spawnDraggableObject() {
    const obj = document.createElement('div');
    obj.className = 'draggable-object';
    obj.textContent = 'DRAG';

    // Initial position centered
    obj.style.left = '50%';
    obj.style.top = '50%';
    obj.style.transform = 'translate(-50%, -50%)';

    obj.addEventListener('mousedown', onDragStart);

    const container = document.querySelector('.app-container') || document.body;
    container.appendChild(obj);
}

function onDragStart(e) {
    currentDragObject = e.target;

    if (!currentDragObject.classList.contains('draggable-object')) return;

    // Calculate initial position if it has transform
    const rect = currentDragObject.getBoundingClientRect();

    // If it was centered with transform, reset to absolute position
    if (currentDragObject.style.transform) {
        currentDragObject.style.transform = 'none';
        currentDragObject.style.left = rect.left + 'px';
        currentDragObject.style.top = rect.top + 'px';
    }

    dragOffset.x = rect.width / 2;
    dragOffset.y = rect.height / 2;

    currentDragObject.style.zIndex = '2000'; // Bring to top
    currentDragObject.style.transition = 'none'; // Disable transition during drag
}

function onDragMove(e) {
    if (!currentDragObject) return;

    e.preventDefault();

    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    currentDragObject.style.left = x + 'px';
    currentDragObject.style.top = y + 'px';
}

function onDragEnd() {
    if (currentDragObject) {
        // Snap to grid
        const rect = currentDragObject.getBoundingClientRect();

        // We need to calculate position relative to the container if we want perfect alignment?
        // But for now, let's just snap the absolute position to nearest 50

        const currentLeft = parseInt(currentDragObject.style.left, 10);
        const currentTop = parseInt(currentDragObject.style.top, 10);

        const snappedLeft = Math.round(currentLeft / GRID_SIZE) * GRID_SIZE;
        const snappedTop = Math.round(currentTop / GRID_SIZE) * GRID_SIZE;

        currentDragObject.style.left = snappedLeft + 'px';
        currentDragObject.style.top = snappedTop + 'px';

        currentDragObject.style.zIndex = '1000';
        currentDragObject.style.transition = 'left 0.2s, top 0.2s'; // Re-enable transition for smooth snap
        currentDragObject = null;
    }
}

window.onload = setupGlobalEvents;
