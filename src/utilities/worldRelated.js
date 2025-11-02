import * as CANNON from 'cannon-es';

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

export const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, 0, -9.82); // Z-axis gravity (you can adjust or disable)
physicsWorld.broadphase = new CANNON.NaiveBroadphase();
physicsWorld.solver.iterations = 10;


const timeStep = 1 / 60;
export function updatePhysics() {
  physicsWorld.step(timeStep);
}