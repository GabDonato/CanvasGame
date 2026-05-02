// Variáveis principais do jogo
let player;              // Jogador (quadrado azul)
let obstacles = [];      // Lista de obstáculos (retângulos vermelhos)
let score = 0;           // Pontuação
let gameState = "start"; // Estados possíveis: "start", "play", "gameover"
let difficulty = 1;      // Nível de dificuldade
let startFrame;          // Frame inicial para calcular tempo
let elapsedTime = 2;     // Tempo congelado ao morrer
let fragments = [];      // Fragmentos do jogador ao despedaçar
let hitObstacle = null;  // Guarda o obstáculo atingido para brilhar

// Setup inicial
function setup() {
  createCanvas(600, 400);
  player = new Player();
}

// Loop principal
function draw() {
  drawBackground();

  if (gameState === "start") {
    startScreen();
  } else if (gameState === "play") {
    playGame();
  } else if (gameState === "gameover") {
    gameOverScreen();
  }
}


// Backgroud
function drawBackground() {
  let ctx = drawingContext;
  let gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgb(115,161,233)");
  gradient.addColorStop(1, "rgb(98,197,211)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}


// Tela inicial
function startScreen() {
  textAlign(CENTER);
  textSize(32);
  fill(20, 40, 80);
  text("Desvie dos Obstáculos!", width/2, height/2 - 40);
  textSize(20);
  fill(40, 60, 100);
  text("Use as Setas Verticais Para se Mover", width/2, height/2);
  text("Pressione ENTER para começar", width/2, height/2 + 30);
}


// HUD (placar e informações)
function drawHUD() {
  stroke(0);
  strokeWeight(1);
  fill(255, 255, 255, 150);
  rect(10, 5, 580, 40, 10);

  noStroke();
  textSize(18);
  fill(0);
  textAlign(LEFT);
  text("Score: " + score, 20, 30);
  text("Dificuldade: " + difficulty, 220, 30);
  let currentTime = int((frameCount - startFrame) / 60); 
  text("Tempo: " + currentTime + "s", 420, 30);
}

// Lógica principal do jogo
function playGame() {
  player.update();
  player.show();

  // aumenta dificuldade conforme pontuação
  if (score % 350 === 0 && score > 0) {
    difficulty++;
  }

  // frequência de obstáculos
  let spawnRate = max(60 - difficulty * 10, 20); 
  if (frameCount % spawnRate === 0) {
    obstacles.push(new Obstacle(difficulty));
  }

  // atualiza obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].update();
    obstacles[i].show();

    // colisão
    if (player.hits(obstacles[i])) {
      elapsedTime = int((frameCount - startFrame) / 60);
      gameState = "gameover";

      // cria fragmentos do jogador
      for (let j = 0; j < 15; j++) {
        fragments.push(new Fragment(player.x, player.y, player.size));
      }

      // marca obstáculo atingido
      obstacles[i].hit = true;
      hitObstacle = obstacles[i];
    }

    // remove obstáculos fora da tela
    if (obstacles[i].offscreen()) {
      obstacles.splice(i, 1);
    }
  }

  score++;
  drawHUD();
}


// Tela de Game Over
function gameOverScreen() {
  // desenha obstáculo atingido com brilho
  if (hitObstacle) {
    hitObstacle.show();
    // resetar estilos para não afetar fragmentos
    noStroke();
    fill(30, 120, 255);
  }

  // desenha fragmentos do jogador
  for (let f of fragments) {
    f.update();
    f.show();
  }

  // textos
  textAlign(CENTER);
  textSize(32);
  fill(20, 40, 80);
  text("Game Over!", width/2, height/2 - 40);
  textSize(20);
  fill(40, 60, 100);
  text("Pontuação: " + score, width/2, height/2);
  text("Tempo jogado: " + elapsedTime + "s", width/2, height/2 + 20);
  text("Pressione ENTER para reiniciar", width/2, height/2 + 60);
}


// Reiniciar jogo
function keyPressed() {
  if ((gameState === "start" || gameState === "gameover") && keyCode === ENTER) {
    gameState = "play";
    score = 0;
    difficulty = 1;
    obstacles = [];
    fragments = [];
    hitObstacle = null;
    startFrame = frameCount;
    elapsedTime = 0;
  }
}

// Class Player
class Player {
  constructor() {
    this.x = 50;
    this.y = height/2;
    this.size = 30;
    this.baseSpeed = 5; 
    this.maxSpeed = 12; 
  }

  update() {
    let currentSpeed = min(this.baseSpeed + difficulty * 0.5, this.maxSpeed);
    if (keyIsDown(UP_ARROW)) this.y -= currentSpeed;
    if (keyIsDown(DOWN_ARROW)) this.y += currentSpeed;
    this.y = constrain(this.y, 0, height - this.size);
  }

  show() {
    fill(30, 120, 255);
    stroke(20, 40, 80);
    strokeWeight(2);
    rect(this.x, this.y, this.size, this.size, 5);
  }

  hits(obstacle) {
    return (this.x < obstacle.x + obstacle.w &&
            this.x + this.size > obstacle.x &&
            this.y < obstacle.y + obstacle.h &&
            this.y + this.size > obstacle.y);
  }
}

// Class Obstacle
class Obstacle {
  constructor(difficulty) {
    this.w = 20;
    this.h = random(40, 120);
    this.x = width;
    this.y = random(0, height - this.h);
    this.speed = 3 + difficulty; 
    this.hit = false;
  }

  update() {
    this.x -= this.speed;
  }

  show() {
    if (this.hit) {
      fill(255, 200, 0);
      stroke(255);
      strokeWeight(3);
    } else {
      fill(220, 40, 40);
      stroke(255, 100, 100);
      strokeWeight(2);
    }
    rect(this.x, this.y, this.w, this.h, 5);
  }

  offscreen() {
    return this.x + this.w < 0;
  }
}

// Classe Fragment
class Fragment {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = random(5, 10);
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.alpha -= 3;
  }

  show() {
    if (this.alpha > 0) {
      fill(30, 120, 255, this.alpha);
      noStroke();
      rect(this.x, this.y, this.size, this.size, 3);
    }
  }
}
