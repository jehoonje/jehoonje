function makeMove(x, y) {
  fetch('https://omok-server.vercel.app/api/move', { // 서버 배포 URL로 변경
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  })
    .then(response => response.json())
    .then(data => {
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
