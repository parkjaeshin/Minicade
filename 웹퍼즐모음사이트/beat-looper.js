/* beat-looper.js */
class BeatLooper {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('score');
        this.comboEl = document.getElementById('combo');
        this.startBtn = document.getElementById('startBtn');

        this.score = 0;
        this.combo = 0;
        this.gameRunning = false;
        this.audioContext = null;
        this.beats = [];
        this.nextBeatTime = 0;
        this.bpm = 140; // 리듬감 있는 템포
        this.beatInterval = (60 / this.bpm) * 1000;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEvents();
        this.createBeatSound();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.w = this.canvas.width;
        this.h = this.canvas.height;
    }

    setupEvents() {
        // 리사이즈
        window.addEventListener('resize', () => this.resizeCanvas());

        // 시작 버튼
        this.startBtn.addEventListener('click', () => this.startGame());

        // 키보드
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleHit();
            }
        });

        // 터치/마우스
        this.canvas.addEventListener('click', () => this.handleHit());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleHit();
        });
    }

    createBeatSound() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playBeatSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.combo = 0;
        this.beats = [];
        this.nextBeatTime = Date.now();
        this.startBtn.disabled = true;
        this.updateUI();

        this.gameLoop();
    }

    handleHit() {
        if (!this.gameRunning) return;

        const now = Date.now();
        const timeDiff = Math.abs(now - this.nextBeatTime);

        if (timeDiff < 150) { // 타이밍 허용 오차
            const accuracy = Math.max(0, 100 - (timeDiff / 150) * 100);
            this.score += Math.floor(accuracy * (this.combo + 1));
            this.combo++;
            this.playBeatSound();
        } else {
            this.combo = 0;
        }

        this.updateUI();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        const now = Date.now();

        // 새 비트 생성 (화면 하단에서 위로)
        if (now >= this.nextBeatTime) {
            this.beats.push({
                x: this.w / 2,
                y: this.h,
                size: 40,
                alpha: 1.0,
                time: this.nextBeatTime
            });
            this.nextBeatTime += this.beatInterval;
        }

        // 비트 업데이트
        this.beats = this.beats.filter(beat => {
            beat.y -= 5; // 속도
            beat.alpha -= 0.02;
            return beat.alpha > 0 && beat.y > -50;
        });

        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    render() {
        // 배경 그라디언트
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.h);
        gradient.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.w, this.h);

        // 타겟 라인
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.h * 0.8);
        this.ctx.lineTo(this.w, this.h * 0.8);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // 비트들 그리기
        this.beats.forEach(beat => {
            this.ctx.save();
            this.ctx.globalAlpha = beat.alpha;
            const pulseSize = beat.size + Math.sin(Date.now() * 0.01) * 10;

            // 외곽 원
            const outerGradient = this.ctx.createRadialGradient(beat.x, beat.y, 0, beat.x, beat.y, pulseSize);
            outerGradient.addColorStop(0, `rgba(255, 255, 255, ${beat.alpha})`);
            outerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            this.ctx.fillStyle = outerGradient;
            this.ctx.beginPath();
            this.ctx.arc(beat.x, beat.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();

            // 내부 원
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.shadowColor = '#ffeb3b';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(beat.x, beat.y, beat.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            this.ctx.restore();
        });
    }

    updateUI() {
        this.scoreEl.textContent = this.score;
        this.comboEl.textContent = this.combo;
    }
}

// 초기화
window.addEventListener('load', () => {
    new BeatLooper();
});
