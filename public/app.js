// public/app.js
document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const messageElement = document.getElementById('message');

  let board = [];
  let currentTurn = '⚫️';
  
  // 서버 API 엔드포인트 URL
  const API_URL = 'https://omok-game-ouzzl67qg-jehoonjes-projects.vercel.app/api/move'; // 실제 서버 배포 URL로 변경

  // 보드 초기화
  function initializeBoard() {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        if (data.board) {
          board = data.board;
          currentTurn = data.currentTurn || '⚫️';
          console.log('Fetched board:', board, 'Current Turn:', currentTurn); // 디버깅 메시지
          renderBoard();
        } else {
          console.error('Invalid board data:', data);
        }
      })
      .catch(error => console.error('Error fetching board:', error));
  }

  // 보드 렌더링
  function renderBoard() {
    boardElement.innerHTML = '';
    board.forEach((row, y) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');
      row.forEach((cell, x) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.textContent = cell;
        cellElement.addEventListener('click', () => makeMove(x, y));
        rowElement.appendChild(cellElement);
      });
      boardElement.appendChild(rowElement);
    });
  }

  // 돌 놓기
  function makeMove(x, y) {
    console.log(`Making move at (${x}, ${y})`); // 디버깅 메시지
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Move response:', data); // 디버깅 메시지
        messageElement.textContent = data.message;
        if (data.reset) {
          board = Array.from({ length: 15 }, () => Array(15).fill('⬜️'));
          currentTurn = '⚫️';
        } else {
          board[y][x] = currentTurn;
          currentTurn = currentTurn === '⚫️' ? '⚪️' : '⚫️';
        }
        renderBoard();
      })
      .catch(error => console.error('Error making move:', error));
  }

  initializeBoard();
});
