export function pauseWorld(pause = true) {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;

    if (pause) {
        gameCanvas.classList.add('blur');
        gameCanvas.style.pointerEvents = 'none';
    } else {
        gameCanvas.classList.remove('blur');
        gameCanvas.style.pointerEvents = 'auto';
    }
}