// 캔버스와 2D 컨텍스트, 시작 화면 요소와 버튼, 사용자 이름 입력 필드를 가져오기
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.querySelector(".start-screen");
const startButton = document.getElementById("startButton");
const usernameInput = document.getElementById("usernameInput");

// 이미지 요소 가져오기
const notImage = document.querySelector('img[src="./not.png"]');
const hoverImage = document.querySelector('img[src="./hover.png"]');

// 캔버스 크기 설정
canvas.width = 1200;
canvas.height = 800;

// 플레이어 객체 정의
let player = {
  x: canvas.width / 2 - 40, // 초기 위치 설정
  y: canvas.height - 100, // 초기 위치 설정
  width: 120, // 플레이어 너비
  height: 100, // 플레이어 높이
  speed: 8, // 플레이어 이동 속도
  dx: 0, // x축 속도
  dy: 0, // y축 속도
  score: 0, // 초기 점수
  image: null, // 플레이어 이미지
  name: "", // 플레이어 이름
};

// 게임 관련 변수 초기화
let blocks = []; // 블록을 저장할 배열
let gameRunning = false; // 게임 상태
let gameSpeed = 3; // 블록이 떨어지는 속도
let level = 1; // 초기 레벨
const maxLevel = 12; // 최대 레벨
const levelUpThreshold = 200; // 레벨업을 위한 점수 기준
let lastUpdateTime = 0; // 마지막 업데이트 시간

// 기본 블록 이미지 로드
let blockImage = new Image();
blockImage.src = "mon.png"; // 초기 블록 이미지 경로

// 두 번째 블록 이미지 로드 (레벨 7 이상에서 사용)
let blockImageLevel7 = new Image();
blockImageLevel7.src = "mad.png"; // 레벨 7부터 사용할 이미지 경로

// 게임 초기화 함수
function initializeGame() {
  const username = usernameInput.value;
  if (username.trim() === "") {
    alert("Please enter your name.");
    return;
  }
  player.name = username; // 사용자 이름 설정

  // 시작 화면과 이미지 숨기기
  startScreen.style.display = "none"; // 시작 화면 숨기기
  notImage.style.display = "none"; // not 이미지 숨기기
  hoverImage.style.display = "none"; // hover 이미지 숨기기

  canvas.style.display = "block"; // 게임 화면 표시
  loadPlayerImage(); // 플레이어 이미지 로드
  startGame(); // 게임 시작
}

// 플레이어 이미지 로드 함수
function loadPlayerImage() {
  player.image = new Image();
  player.image.src = "face.png"; // 플레이어 이미지 경로 설정
}

// 게임 시작 함수
function startGame() {
  gameRunning = true;
  requestAnimationFrame(updateGame); // 게임 루프 시작
}

// 게임 상태 업데이트 함수
function updateGame(timestamp) {
  if (!gameRunning) return;

  const deltaTime = timestamp - lastUpdateTime;
  lastUpdateTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기
  ctx.fillStyle = "#000"; // 배경색 설정
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기

  moveBlocks(); // 블록 이동
  drawBlocks(); // 블록 그리기
  updatePlayerPosition(); // 플레이어 위치 업데이트
  drawPlayer(); // 플레이어 그리기
  checkCollision(); // 충돌 감지

  // 점수와 레벨 업데이트
  if (player.score >= level * levelUpThreshold && level < maxLevel) {
    level++;
    gameSpeed += 1; // 레벨이 오를 때마다 게임 속도 증가
    player.speed += 0.3; // 레벨이 오를 때마다 플레이어 속도 증가
  }

  player.score++; // 점수 증가
  drawScoreAndLevel(); // 점수와 레벨 표시

  requestAnimationFrame(updateGame); // 다음 프레임 요청
}

// 플레이어를 캔버스에 그리는 함수
function drawPlayer() {
  if (player.image) {
    ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "#f00"; // 플레이어의 기본 색상
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

// 블록을 이동시키는 함수
function moveBlocks() {
  if (Math.random() < 0.02) {
    let blockX = Math.random() * (canvas.width - 30);
    blocks.push({ x: blockX, y: -30, width: 30, height: 30 });
  }

  blocks.forEach((block) => {
    block.y += gameSpeed;
  });

  blocks = blocks.filter((block) => block.y < canvas.height); // 화면을 벗어난 블록 제거
}

// 블록을 캔버스에 그리는 함수
function drawBlocks() {
  const blockWidth = 150; // 블록 이미지의 너비 설정
  const blockHeight = 200; // 블록 이미지의 높이 설정

  blocks.forEach((block) => {
    // 레벨에 따라 사용할 블록 이미지 선택
    const currentBlockImage = level >= 7 ? blockImageLevel7 : blockImage;

    if (currentBlockImage) {
      ctx.drawImage(currentBlockImage, block.x, block.y, blockWidth, blockHeight);
    } else {
      ctx.fillStyle = "#f00";
      ctx.fillRect(block.x, block.y, blockWidth, blockHeight);
    }
  });
}

// 플레이어와 블록의 충돌을 감지하는 함수
function checkCollision() {
  blocks.forEach((block) => {
    // 충돌 감지
    if (isColliding(player, block)) {
      gameRunning = false;
      alert(`Game Over! Your score: ${player.score}`);
      location.reload(); // 게임 종료 후 페이지 새로고침
    }
  });
}

// 플레이어와 블록 간의 충돌 여부를 판단하는 함수
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}

// 점수와 레벨을 화면에 그리는 함수
function drawScoreAndLevel() {
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Name: ${player.name}`, 10, 40); // 사용자 이름 표시
  ctx.font = "bold 20px Arial";
  ctx.fillText(`Score: ${player.score}`, 10, 70); // 점수 표시
  ctx.fillText(`Level: ${level}`, 10, 100); // 레벨 표시
}

// 플레이어 위치를 업데이트하는 함수
function updatePlayerPosition() {
  player.x += player.dx; // 플레이어의 x축 위치 업데이트
  player.y += player.dy; // 플레이어의 y축 위치 업데이트

  // 플레이어가 화면 밖으로 나가지 않도록 제한
  if (player.x < 0) {
    player.x = 0;
  } else if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y < 0) {
    player.y = 0;
  } else if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
  }
}

// 키가 눌렸을 때의 이벤트 처리
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    player.dx = -player.speed; // 왼쪽으로 이동
  } else if (event.key === "ArrowRight") {
    player.dx = player.speed; // 오른쪽으로 이동
  } else if (event.key === "Enter") {
    if (!gameRunning) {
      initializeGame(); // 게임 초기화 및 시작
    }
  }
});

// 키가 떼졌을 때의 이벤트 처리
document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    player.dx = 0; // x축 이동 중지
  }
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    player.dy = 0; // y축 이동 중지
  }
});

// 시작 버튼 클릭 시 게임 초기화 및 시작
startButton.onclick = function () {
  initializeGame();
};
// 네온 메시지 요소 가져오기
const neonMessage = document.getElementById("neonMessage");

// 레벨 업 함수에서 네온 메시지 표시 및 숨기기
function showNeonMessage() {
  neonMessage.style.display = "block"; // 메시지 표시
  setTimeout(() => {
    neonMessage.style.display = "none"; // 2초 후에 메시지 숨기기
  }, 2000);
}

// 게임 상태 업데이트 함수 수정
function updateGame(timestamp) {
  if (!gameRunning) return;

  const deltaTime = timestamp - lastUpdateTime;
  lastUpdateTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기
  ctx.fillStyle = "#000"; // 배경색 설정
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기

  moveBlocks(); // 블록 이동
  drawBlocks(); // 블록 그리기
  updatePlayerPosition(); // 플레이어 위치 업데이트
  drawPlayer(); // 플레이어 그리기
  checkCollision(); // 충돌 감지

  // 점수와 레벨 업데이트
  if (player.score >= level * levelUpThreshold && level < maxLevel) {
    level++;
    gameSpeed += 1; // 레벨이 오를 때마다 게임 속도 증가
    player.speed += 0.3; // 레벨이 오를 때마다 플레이어 속도 증가

    if (level === 7) {
      showNeonMessage(); // 레벨 7에 도달하면 네온 메시지 표시
    }
  }

  player.score++; // 점수 증가
  drawScoreAndLevel(); // 점수와 레벨 표시

  requestAnimationFrame(updateGame); // 다음 프레임 요청
}

// 오디오 파일 로드
var audio = new Audio("sound.mp3");
audio.play();

// 게임 상태 업데이트 함수 수정
function updateGame(timestamp) {
  if (!gameRunning) return;

  const deltaTime = timestamp - lastUpdateTime;
  lastUpdateTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기
  ctx.fillStyle = "#000"; // 배경색 설정
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 배경 그리기

  moveBlocks(); // 블록 이동
  drawBlocks(); // 블록 그리기
  updatePlayerPosition(); // 플레이어 위치 업데이트
  drawPlayer(); // 플레이어 그리기
  checkCollision(); // 충돌 감지

  // 점수와 레벨 업데이트
  if (player.score >= level * levelUpThreshold && level < maxLevel) {
    level++;
    gameSpeed += 1; // 레벨이 오를 때마다 게임 속도 증가
    player.speed += 0.3; // 레벨이 오를 때마다 플레이어 속도 증가

    if (level === 7) {
      showNeonMessage(); // 레벨 7에 도달하면 네온 메시지 표시
      levelUpSound.play(); // 레벨 7에 도달하면 오디오 재생
    }
  }

  player.score++; // 점수 증가
  drawScoreAndLevel(); // 점수와 레벨 표시

  requestAnimationFrame(updateGame); // 다음 프레임 요청
}
