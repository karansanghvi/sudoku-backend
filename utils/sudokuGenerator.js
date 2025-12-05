// to create an empty sudoku board
function createBoard(size) {
  let board = [];
  for (let i = 0; i < size; i++) {
    board.push(new Array(size).fill(null));
  }
  return board;
};

// check if the number is valid according to sudoku
function isValid(board, row, col, num, size, subH, subW) {
  for (let i = 0; i < size; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  let startRow = Math.floor(row / subH) * subH;
  let startCol = Math.floor(col / subW) * subW;

  for (let r = 0; r < subH; r++) {
    for (let c = 0; c < subW; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
};

// it will count how many solutions exist 
function countSolutions(board, size, subH, subW) {
    let count = 0;

    function solve(tempBoard) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (tempBoard[row][col] === null) {
                    for (let num = 1; num <= size; num++) {
                        if (isValid(tempBoard, row, col, num, size, subH, subW)) {
                            tempBoard[row][col] = num;
                            solve(tempBoard);
                            tempBoard[row][col] = null;
                            if (count > 1) return;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }

    const temp = board.map(r => [...r]);
    solve(temp);
    return count;
};

// fills the board with random numbers (backtracking)
function fillBoardBacktracking(board, size, subH, subW) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === null) {
                const numbers = [...Array(size).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
                for (let num of numbers) {
                    if (isValid(board, row, col, num, size, subH, subW)) {
                        board[row][col] = num;
                        if (fillBoardBacktracking(board, size, subH, subW)) {
                            return true;
                        }
                        board[row][col] = null;
                    }
                }
                return false;
            }
        }
    }
    return true;
};

// removes a set of cells with making sure to keep one solution
function removeCells(board, countToRemove, size, subH, subW) {
  let removed = 0;
  while (removed < countToRemove) {
    let r = Math.floor(Math.random() * board.length);
    let c = Math.floor(Math.random() * board.length);
    if (board[r][c] !== null) {
        const backup = board[r][c];
        board[r][c] = null;

        const solutions = countSolutions(board, size, subH, subW);
        if (solutions !== 1) {
            board[r][c] = backup;
        } else {
            removed++;
        }
    }
  }
};

// Generate a 9x9 Normal game
const generateNormalBoard = () => {
  const size = 9, subH = 3, subW = 3;
  const cellsToKeep = 28 + Math.floor(Math.random() * 3);
  
  let board = createBoard(size);
  fillBoardBacktracking(board, size, subH, subW);
  
  const solution = board.map(row => [...row]);
  
  removeCells(board, size * size - cellsToKeep, size, subH, subW);
  
  return { puzzle: board, solution: solution }; 
};

// Generate a 6x6 Easy game
const generateEasyBoard = () => {
  const size = 6, subH = 2, subW = 3;
  const cellsToKeep = 18;
  
  let board = createBoard(size);
  fillBoardBacktracking(board, size, subH, subW);
  
  const solution = board.map(row => [...row]);
  
  removeCells(board, size * size - cellsToKeep, size, subH, subW);
  
  return { puzzle: board, solution: solution }; 
};

const generateGameName = () => {
    const words = [
        'Happy', 'Blue', 'Red', 'Green', 'Golden', 'Silver', 'Bright', 'Dark',
        'Swift', 'Brave', 'Calm', 'Wild', 'Noble', 'Ancient', 'Mystic', 'Crystal',
        'Mountain', 'River', 'Ocean', 'Forest', 'Desert', 'Valley', 'Canyon', 'Lake',
        'Storm', 'Thunder', 'Lightning', 'Rainbow', 'Sunrise', 'Sunset', 'Starlight',
        'Dragon', 'Phoenix', 'Eagle', 'Wolf', 'Bear', 'Tiger', 'Lion', 'Hawk',
        'Emerald', 'Ruby', 'Diamond', 'Pearl', 'Sapphire', 'Jade', 'Opal', 'Amber',
        'Castle', 'Tower', 'Kingdom', 'Empire', 'Palace', 'Fortress', 'Temple', 'Shrine',
        'Warrior', 'Knight', 'Guardian', 'Champion', 'Hero', 'Legend', 'Master', 'Sage',
        'Fire', 'Water', 'Earth', 'Wind', 'Ice', 'Shadow', 'Light', 'Moon',
        'Spirit', 'Soul', 'Dream', 'Fate', 'Quest', 'Journey', 'Adventure', 'Destiny'
    ];

    const wordOne = words[Math.floor(Math.random() * words.length)];
    const wordTwo = words[Math.floor(Math.random() * words.length)];
    const wordThree = words[Math.floor(Math.random() * words.length)];

    return `${wordOne}${wordTwo}${wordThree}`;
};

module.exports = {
    generateNormalBoard,
    generateEasyBoard,
    generateGameName
}