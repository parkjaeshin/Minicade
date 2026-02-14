let score = 0;
const scoreElement = document.getElementById('score');
const character = document.getElementById('dujonku-character');

// Web Audio API to synthesize a "crunchy" sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCrunchSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const duration = 0.15;
    const sampleRate = audioCtx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise with falling amplitude for a crunchy effect
    for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.max(0, 1 - i / bufferSize);
        // Add some "crunch" by using random noise with a bit of low-pass character
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound more like a cookie crunch than just static
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.Q.setValueAtTime(1, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noise.start();
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    document.body.appendChild(particle);

    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size / 2}px`;

    const destinationX = x + (Math.random() - 0.5) * 200;
    const destinationY = y + (Math.random() - 0.5) * 200;
    const rotation = Math.random() * 360;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.transform = `rotate(${rotation}deg)`;

    const animation = particle.animate([
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${destinationX - x}px, ${destinationY - y}px) rotate(${rotation + 720}deg)`, opacity: 0 }
    ], {
        duration: 500 + Math.random() * 500,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        particle.remove();
    };
}

character.addEventListener('mousedown', (e) => {
    score++;
    scoreElement.textContent = score;

    playCrunchSound();

    // Create a few crunchy particles
    for (let i = 0; i < 5; i++) {
        createParticle(e.clientX, e.clientY);
    }
});

// For touch devices
character.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    score++;
    scoreElement.textContent = score;

    playCrunchSound();

    for (let i = 0; i < 5; i++) {
        createParticle(touch.clientX, touch.clientY);
    }
});
