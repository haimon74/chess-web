import { GameState, Position, PieceColor, PIECE_VALUES } from '../types/chess';
import { makeMove, calculateValidMoves, isKingInCheck, isCheckmate, isStalemate } from './chessLogic';

interface Move {
  from: Position;
  to: Position;
  score?: number;
}

const getDepthFromLevel = (level: number): number => {
  // Level 1: depth 2, Level 2: depth 3, etc.
  return Math.min(level + 1, 5);
};

const evaluatePosition = (gameState: GameState): number => {
  let score = 0;
  
  // Material evaluation
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        score += piece.color === 'white' ? value : -value;
      }
    }
  }

  // Mobility evaluation (number of legal moves)
  const whiteMoves = getAllLegalMoves(gameState, 'white').length;
  const blackMoves = getAllLegalMoves(gameState, 'black').length;
  score += (whiteMoves - blackMoves) * 0.1;

  // Center control evaluation
  const centerSquares = [
    { row: 3, col: 3 }, { row: 3, col: 4 },
    { row: 4, col: 3 }, { row: 4, col: 4 }
  ];
  
  for (const square of centerSquares) {
    const piece = gameState.board[square.row][square.col];
    if (piece) {
      score += piece.color === 'white' ? 0.1 : -0.1;
    }
  }

  // King safety evaluation
  if (isKingInCheck(gameState)) {
    score += gameState.currentTurn === 'white' ? -0.5 : 0.5;
  }

  return score;
};

const getAllLegalMoves = (gameState: GameState, color: PieceColor): Move[] => {
  const moves: Move[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const validMoves = calculateValidMoves({ row, col }, gameState);
        for (const move of validMoves) {
          moves.push({ from: { row, col }, to: move });
        }
      }
    }
  }
  return moves;
};

const minimax = (
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  // Terminal conditions
  if (depth === 0 || isCheckmate(gameState) || isStalemate(gameState)) {
    return evaluatePosition(gameState);
  }

  const moves = getAllLegalMoves(gameState, gameState.currentTurn);
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.from, move.to);
      const score = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(gameState, move.from, move.to);
      const score = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const calculateComputerMove = (gameState: GameState): Move | null => {
  const depth = getDepthFromLevel(gameState.computerLevel);
  const moves = getAllLegalMoves(gameState, gameState.currentTurn);
  
  if (moves.length === 0) return null;

  let bestMove: Move | null = null;
  let bestScore = gameState.currentTurn === 'white' ? -Infinity : Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  for (const move of moves) {
    const newState = makeMove(gameState, move.from, move.to);
    const score = minimax(newState, depth - 1, alpha, beta, gameState.currentTurn === 'black');

    if (gameState.currentTurn === 'white') {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}; 