import React from 'react';
import { Piece, Position, BoardTheme } from '../types/chess';
import { UNICODE_PIECES } from '../types/chess';
import styles from './ChessBoard.module.css';

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

  const getPieceImage = (piece: Piece) => {
    const colorPrefix = piece.color === 'white' ? 'light' : 'dark';
    return `/assets/images/${colorPrefix}_${piece.type}.svg`;
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
        className={`${styles.square} ${isSelected ? styles.selected : ''} ${isValidMove ? styles.validMove : ''} ${isKingChecked ? styles.kingInCheck : ''}`}
        style={{ backgroundColor: squareColor }}
        onClick={() => onSquareClick({ row, col })}
      >
        {piece && (
          <div
            className={`${styles.piece} ${piece.color === 'white' ? styles.whitePiece : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onPieceClick({ row, col });
            }}
          >
            <img 
              src={getPieceImage(piece)} 
              alt={UNICODE_PIECES[piece.color][piece.type]} 
              className={styles.pieceImage}
            />
          </div>
        )}
        {isValidMove && <div className={styles.validMoveIndicator} />}
      </div>
    );
  };

  const renderBoardLabels = () => {
    const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
      <>
        <div className={`${styles.boardLabels} ${styles.files}`}>
          {files.map((file, index) => (
            <div key={file} className={styles.label}>
              {file}
            </div>
          ))}
        </div>
        <div className={`${styles.boardLabels} ${styles.ranks}`}>
          {ranks.map((rank, index) => (
            <div key={rank} className={`${styles.label} ${styles.rank}`}>
              {rank}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={styles.chessBoardContainer}>
      {renderBoardLabels()}
      <div className={styles.chessBoard}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.boardRow}>
            {row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard; 