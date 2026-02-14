document.addEventListener('DOMContentLoaded', () => {
    const playButtons = document.querySelectorAll('.play-btn');

    playButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const gameTitle = e.target.parentElement.querySelector('h3').innerText;
            console.log(`Starting ${gameTitle}...`);
            // Future link logic here: window.location.href = 'path/to/game';
            //alert(`${gameTitle} 플레이를 준비 중입니다!`);
        });
    });

    // Add subtle entrance animation for game cards
    const cards = document.querySelectorAll('.game-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
