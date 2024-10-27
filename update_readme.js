const fs = require('fs');
const https = require('https');

// README 파일의 시작과 끝 부분 설정
const START = '<!-- BOARD START -->';
const END = '<!-- BOARD END -->';

// 흰돌과 검은돌을 더 명확하게 표시하기 위한 대체 문자 사용
const WHITE_STONE = '◯'; // 원(circle)으로 대체
const BLACK_STONE = '●'; // 검은 원으로 대체
const EMPTY_STONE = '⬜️';

// 보드 데이터를 가져오는 함수
function fetchBoardData(callback) {
  https.get('https://omok-game-app-ea4b1b706acd.herokuapp.com/board', (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    // 응답의 Content-Type 확인
    const contentType = res.headers['content-type'];
    console.log(`Content-Type: ${contentType}`);

    // 상태 코드와 Content-Type 검증
    if (res.statusCode !== 200) {
      console.error(`Failed to fetch board: ${res.statusCode}`);
      res.resume(); // 응답 데이터를 소비하여 연결을 해제
      process.exit(1);
    }

    if (!contentType || !contentType.includes('application/json')) {
      console.error(`Invalid content-type. Expected application/json but received ${contentType}`);
      res.resume();
      process.exit(1);
    }

    // 데이터 수신
    res.on('data', (chunk) => {
      data += chunk;
    });

    // 데이터 수신 완료
    res.on('end', () => {
      try {
        const boardData = JSON.parse(data);
        callback(null, boardData.board);
      } catch (error) {
        callback(error, null);
      }
    });
  }).on('error', (err) => {
    callback(err, null);
  });
}

// 보드 데이터를 마크다운 형식의 테이블로 변환하는 함수
function generateMarkdownTable(board) {
  // 열 머리글 (A-O)
  const headers = ['   ', ...Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i))];
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `|${headers.map(() => '---').join('|')}|`;

  // 각 행 생성
  const rows = board.map((row, index) => {
    const rowNumber = index + 1;
    const formattedRowNumber = rowNumber < 10 ? ` ${rowNumber}` : `${rowNumber}`;
    const rowContent = row.map(cell => {
      if (cell === '⚪️') return WHITE_STONE;
      if (cell === '⚫️') return BLACK_STONE;
      return EMPTY_STONE;
    }).join(' | ');
    return `| ${formattedRowNumber} | ${rowContent} |`;
  });

  // 전체 테이블
  return [headerRow, separatorRow, ...rows].join('\n');
}

// README.md 파일을 업데이트하는 함수
function updateReadme(boardMarkdown) {
  try {
    let readme = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readme.replace(
      new RegExp(`${START}[\\s\\S]*${END}`),
      `${START}\n\`\`\`markdown\n${boardMarkdown}\`\`\`\n${END}`
    );
    fs.writeFileSync('README.md', updatedReadme, 'utf8');
    console.log('README.md updated successfully.');
  } catch (error) {
    console.error('Error updating README.md:', error);
    process.exit(1);
  }
}

// 메인 함수
function main() {
  fetchBoardData((err, board) => {
    if (err) {
      console.error('Error fetching board data:', err);
      process.exit(1);
    }
    const boardMarkdown = generateMarkdownTable(board);
    updateReadme(boardMarkdown);
  });
}

main();
