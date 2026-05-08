# 🚀 Cognira: The 3D Asymmetric Educational Race

[![Tech](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Multiplayer](https://img.shields.io/badge/Multiplayer-WebSocket-blue?style=for-the-badge)](https://socket.io/)
[![Market](https://img.shields.io/badge/Focus-EdTech%20%26%20Gamification-green?style=for-the-badge)](https://github.com/)

> **"Redirecting gaming enthusiasm toward academic growth through real-time competition."**

**Cognira** is a 3D asymmetric competitive educational game that transforms the traditional "learning app" into an exciting, real-time race. Built for the web, it leverages high-fidelity 3D environments and instant multiplayer synchronization to make cognitive development feel as rewarding as a top-tier mobile game.

---

## 👥 The Development Team
- **Kevin Fujianto**
- **Niko Sutiono**
- **Laurentius Nelson Raharjo**
- **Imran Muhammad Rahmatullah**
- **Terrence Willem Susilo**

---

## 💡 The Concept: "The Education Gap"
In Indonesia, over 80% of students face challenges in mastering core skills like Mathematics and logical reasoning. While traditional educational methods often feel monotonous, competitive mobile gaming has seen a massive surge in popularity among students.

**Cognira's Mission:** To plant the seed of interest in academic competition by using the same "dopamine-driven" mechanics found in popular games like *Mobile Legends* or *Free Fire*, but redirecting that energy toward numerical, linguistic, and logical reasoning.

---

## 🎮 Gameplay Mechanics

### 🏁 The Race
Players compete in a 3D environment to reach the finish line first[cite: 12]. Progress is not just about speed, but about intellectual accuracy and strategic timing.

### 🧩 Educational Mini-Games
To move forward, players must conquer rapid-fire challenges in:
- **Numerical Reasoning:** Math-based puzzles and calculations.
- **Linguistic Skills:** Language and vocabulary challenges.
- **Logical Reasoning:** Pattern recognition and problem-solving.

### 🃏 Strategy Cards (Buffs & Debuffs)
Before each round, players select cards to influence the race:
- **Buffs:** x3 movement boosts to pull ahead.
- **Debuffs:** Penalty cards to slow down opponents and shift the balance of the game.

---

## 🛠️ Technical Implementation

### 🌐 3D Gameplay (Three.js)
The core of Cognira is built using **Three.js**, allowing for a rich, immersive 3D experience directly in the browser without requiring heavy downloads. This ensures accessibility for students using various mobile devices and laptops.

### ⚡ Real-Time Multiplayer (WebSockets)
To facilitate the "Competitive" aspect, Cognira uses a **WebSocket client** architecture. This enables:
- **Instant Synchronization:** Real-time tracking of opponent positions on the 3D map.
- **Dynamic Interactions:** Immediate application of buff/debuff cards during the race.
- **Social Engagement:** A competitive environment that mimics the feel of modern multiplayer arenas.

---
## 📦 Prerequisites & Setup
* Node.js (required for WebSocket server management and dependency handling)
* Modern Web Browser (WebGL compatible for Three.js rendering)
* Nodemon (Installed globally: npm install -g nodemon)

## Installation & Local Development

**1. Clone the repository:**
```
git clone https://github.com/NS2006/cognira.git
```

**2. Install dependencies:**
```
npm install
```

**3. Run the application:**
To start the project, you must run the following two commands parallel in two different terminal windows:

**Terminal A: Watch & Bundle the Frontend**
```
nodemon --exec "browserify src/main.js -p esmify > public/bundle.js" --ignore ./public/ --ignore ./server/
```

**Terminal B: Start the Backend Server**
```
nodemon server/index.js --ignore ./public/ --ignore ./client/
```

**4. Access the Game:**
Open your browser and navigate to:
```
http://localhost:3000/
```

---

**Note on Local Play: Since this is running locally, you will need to open 4 different browser tabs and join the game in each to simulate the multiplayer environment. While this local setup requires multiple tabs, the project is intended for global deployment where 4 different devices would connect to the same session and play together.**