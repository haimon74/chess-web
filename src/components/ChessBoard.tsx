import React from 'react';
import { Piece, Position, BoardTheme } from '../types/chess';
import { UNICODE_PIECES } from '../types/chess';
import './ChessBoard.css';

interface ChessBoardProps {
  board: (Piece | null)[][];
  selectedPiece: Position | null;
  validMoves: Position[];
  onPieceClick: (position: Position) => void;
  onSquareClick: (position: Position) => void;
  theme: BoardTheme;
  isCheck: boolean;
  gameState: any;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedPiece,
  validMoves,
  onPieceClick,
  onSquareClick,
  theme,
  isCheck,
  gameState,
}) => {
  const getSquareColor = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0;
    switch (theme) {
      case 'classic':
        return isLight ? '#ffffff' : '#b0b0b0';
      case 'brown':
        return isLight ? '#e8c39e' : '#8b4513';
      case 'green':
        return isLight ? '#e8f5e9' : '#2e7d32';
      case 'navy':
        return isLight ? '#ffffff' : '#1a237e';
      default:
        return isLight ? '#ffffff' : '#b0b0b0';
    }
  };

  const isSquareValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSquareSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isKingInCheck = (row: number, col: number): boolean => {
    if (!isCheck) return false;
    const piece = board[row][col];
    return piece?.type === 'king' && piece.color === gameState.currentTurn;
  };

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const squareColor = getSquareColor(row, col);
    const isValidMove = isSquareValidMove(row, col);
    const isSelected = isSquareSelected(row, col);
    const isKingChecked = isKingInCheck(row, col);

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''} ${isKingChecked ? 'king-in-check' : ''}`}
        style={{ backgroundColor: squareColor }}
        onClick={() => onSquareClick({ row, col })}
      >
        {piece && (
          <div
            className="piece"
            onClick={(e) => {
              e.stopPropagation();
              onPieceClick({ row, col });
            }}
          >
            {UNICODE_PIECES[piece.color][piece.type]}
          </div>
        )}
        {isValidMove && <div className="valid-move-indicator" />}
      </div>
    );
  };

  const renderBoardLabels = () => {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
      <>
        <div className="board-labels files">
          {files.map((file, index) => (
            <div key={file} className="label file">
              {file}
            </div>
          ))}
        </div>
        <div className="board-labels ranks">
          {ranks.map((rank, index) => (
            <div key={rank} className="label rank">
              {rank}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="chess-board-container">
      {renderBoardLabels()}
      <div className="chess-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard; 