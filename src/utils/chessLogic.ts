import { Piece, Position, GameState, PieceType, PieceColor, PIECE_VALUES } from '../types/chess';

export const initializeBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Initialize pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }

  // Initialize other pieces
  const backRankPieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRankPieces[col], color: 'black', hasMoved: false };
    board[7][col] = { type: backRankPieces[col], color: 'white', hasMoved: false };
  }

  return board;
};

const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const isSquareUnderAttack = (position: Position, gameState: GameState, defendingColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color !== defendingColor) {
        const moves = calculateValidMoves({ row, col }, gameState);
        if (moves.some(move => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

const isKingInCheck = (gameState: GameState): boolean => {
  let kingPosition: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.type === 'king' && piece.color === gameState.currentTurn) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }

  if (!kingPosition) return false;
  return isSquareUnderAttack(kingPosition, gameState, gameState.currentTurn);
};

const isCheckmate = (gameState: GameState): boolean => {
  if (!isKingInCheck(gameState)) return false;

  // Try all possible moves for all pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        const moves = calculateValidMoves({ row, col }, gameState);
        for (const move of moves) {
          const newGameState = makeMove(gameState, { row, col }, move);
          if (!isKingInCheck(newGameState)) {
            return false;
          }
        }
      }
    }
  }
  return true;
};

const isStalemate = (gameState: GameState): boolean => {
  if (isKingInCheck(gameState)) return false;

  // Check if any legal moves exist
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        const moves = calculateValidMoves({ row, col }, gameState);
        if (moves.length > 0) {
          return false;
        }
      }
    }
  }
  return true;
};

export const calculateValidMoves = (position: Position, gameState: GameState): Position[] => {
  const piece = gameState.board[position.row][position.col];
  if (!piece) return [];

  const moves: Position[] = [];
  const { row, col } = position;

  switch (piece.type) {
    case 'pawn':
      calculatePawnMoves(position, gameState, moves);
      break;
    case 'knight':
      calculateKnightMoves(position, gameState, moves);
      break;
    case 'bishop':
      calculateBishopMoves(position, gameState, moves);
      break;
    case 'rook':
      calculateRookMoves(position, gameState, moves);
      break;
    case 'queen':
      calculateQueenMoves(position, gameState, moves);
      break;
    case 'king':
      calculateKingMoves(position, gameState, moves);
      break;
  }

  return moves;
};

const calculatePawnMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Forward move
  if (isValidPosition(row + direction, col) && !gameState.board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    // Double move from starting position
    if (row === startRow && !gameState.board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // Captures
  for (const captureCol of [col - 1, col + 1]) {
    if (isValidPosition(row + direction, captureCol)) {
      const targetPiece = gameState.board[row + direction][captureCol];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push({ row: row + direction, col: captureCol });
      }
    }
  }
};

const calculateKnightMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const knightMoves = [
    { row: row - 2, col: col - 1 }, { row: row - 2, col: col + 1 },
    { row: row - 1, col: col - 2 }, { row: row - 1, col: col + 2 },
    { row: row + 1, col: col - 2 }, { row: row + 1, col: col + 2 },
    { row: row + 2, col: col - 1 }, { row: row + 2, col: col + 1 }
  ];

  for (const move of knightMoves) {
    if (isValidPosition(move.row, move.col)) {
      const targetPiece = gameState.board[move.row][move.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(move);
      }
    }
  }
};

const calculateBishopMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ];

  for (const direction of directions) {
    let currentRow = row + direction.row;
    let currentCol = col + direction.col;

    while (isValidPosition(currentRow, currentCol)) {
      const targetPiece = gameState.board[currentRow][currentCol];
      if (!targetPiece) {
        moves.push({ row: currentRow, col: currentCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: currentRow, col: currentCol });
        }
        break;
      }
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
};

const calculateRookMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const directions = [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ];

  for (const direction of directions) {
    let currentRow = row + direction.row;
    let currentCol = col + direction.col;

    while (isValidPosition(currentRow, currentCol)) {
      const targetPiece = gameState.board[currentRow][currentCol];
      if (!targetPiece) {
        moves.push({ row: currentRow, col: currentCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: currentRow, col: currentCol });
        }
        break;
      }
      currentRow += direction.row;
      currentCol += direction.col;
    }
  }
};

const calculateQueenMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  calculateBishopMoves(position, gameState, moves);
  calculateRookMoves(position, gameState, moves);
};

const calculateKingMoves = (position: Position, gameState: GameState, moves: Position[]) => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      if (rowOffset === 0 && colOffset === 0) continue;

      const newRow = row + rowOffset;
      const newCol = col + colOffset;

      if (isValidPosition(newRow, newCol)) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
  }

  // Add castling moves if applicable
  if (!piece.hasMoved) {
    // Kingside castling
    if (canCastle(position, gameState, true)) {
      moves.push({ row, col: col + 2 });
    }
    // Queenside castling
    if (canCastle(position, gameState, false)) {
      moves.push({ row, col: col - 2 });
    }
  }
};

const canCastle = (position: Position, gameState: GameState, isKingside: boolean): boolean => {
  const { row, col } = position;
  const piece = gameState.board[row][col]!;
  const rookCol = isKingside ? 7 : 0;
  const rook = gameState.board[row][rookCol];

  if (!rook || rook.type !== 'rook' || rook.hasMoved || rook.color !== piece.color) {
    return false;
  }

  const direction = isKingside ? 1 : -1;
  const endCol = isKingside ? 6 : 2;

  // Check if path is clear
  for (let c = col + direction; c !== endCol; c += direction) {
    if (gameState.board[row][c]) {
      return false;
    }
  }

  // Check if king would move through check
  for (let c = col; c !== endCol; c += direction) {
    if (isSquareUnderAttack({ row, col: c }, gameState, piece.color)) {
      return false;
    }
  }

  return true;
};

export const makeMove = (gameState: GameState, from: Position, to: Position): GameState => {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col]!;
  
  // Handle castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const isKingside = to.col > from.col;
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? to.col - 1 : to.col + 1;
    
    // Move rook
    newBoard[to.row][rookToCol] = newBoard[to.row][rookFromCol];
    newBoard[to.row][rookFromCol] = null;
  }

  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: 'queen', color: piece.color, hasMoved: true };
  } else {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  }
  newBoard[from.row][from.col] = null;

  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
    selectedPiece: null,
    validMoves: [],
  };

  // Check for check and checkmate
  const isCheck = isKingInCheck(newGameState);
  const checkmateStatus = isCheck && isCheckmate(newGameState);
  const stalemateStatus = !isCheck && isStalemate(newGameState);

  return {
    ...newGameState,
    isCheck,
    isCheckmate: checkmateStatus,
    isStalemate: stalemateStatus,
  };
};

export const evaluatePosition = (gameState: GameState): number => {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        score += piece.color === 'white' ? value : -value;
      }
    }
  }
  return score;
};

export const calculateComputerMove = (gameState: GameState): { from: Position; to: Position } | null => {
  const validMoves: { from: Position; to: Position; score: number }[] = [];

  // Collect all valid moves for the computer's pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === gameState.currentTurn) {
        const moves = calculateValidMoves({ row, col }, gameState);
        for (const move of moves) {
          // Calculate a simple score for each move
          let score = 0;
          const targetPiece = gameState.board[move.row][move.col];
          
          // Add points for capturing pieces
          if (targetPiece) {
            score += PIECE_VALUES[targetPiece.type] * 10;
          }
          
          // Add points for moving to center squares
          const centerDistance = Math.abs(3.5 - move.row) + Math.abs(3.5 - move.col);
          score += (7 - centerDistance) * 0.1;
          
          // Add points for moving pawns forward
          if (piece.type === 'pawn') {
            score += piece.color === 'white' ? (7 - move.row) * 0.5 : move.row * 0.5;
          }
          
          // Add points for developing pieces (moving knights and bishops from back rank)
          if ((piece.type === 'knight' || piece.type === 'bishop') && !piece.hasMoved) {
            score += 0.5;
          }
          
          // Add points for castling
          if (piece.type === 'king' && Math.abs(move.col - col) === 2) {
            score += 1;
          }
          
          // Add points for checking the opponent
          const newState = makeMove(gameState, { row, col }, move);
          if (isKingInCheck(newState)) {
            score += 1;
          }
          
          validMoves.push({ from: { row, col }, to: move, score });
        }
      }
    }
  }

  if (validMoves.length === 0) return null;

  // Sort moves by score and randomly choose from the top 3 moves
  validMoves.sort((a, b) => b.score - a.score);
  const topMoves = validMoves.slice(0, Math.min(3, validMoves.length));
  const randomMove = topMoves[Math.floor(Math.random() * topMoves.length)];

  return { from: randomMove.from, to: randomMove.to };
}; 