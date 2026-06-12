export type Player = 'X' | 'O'
export type Cell = Player | null
export type Board = Cell[]

export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function getWinner(board: Board): Player | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }
  return null
}

export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && !getWinner(board)
}

export function isGameOver(board: Board): boolean {
  return getWinner(board) !== null || isDraw(board)
}

function minimax(board: Board, player: Player, ai: Player): number {
  const winner = getWinner(board)
  if (winner === ai) return 1
  if (winner && winner !== ai) return -1
  if (isDraw(board)) return 0

  const opponent: Player = player === 'X' ? 'O' : 'X'
  const scores: number[] = []

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const next = [...board]
      next[i] = player
      scores.push(minimax(next, opponent, ai))
    }
  }

  return player === ai ? Math.max(...scores) : Math.min(...scores)
}

function bestMove(board: Board, ai: Player): number {
  const human: Player = ai === 'X' ? 'O' : 'X'
  let best = -Infinity
  let move = -1

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      const next = [...board]
      next[i] = ai
      const score = minimax(next, human, ai)
      if (score > best) {
        best = score
        move = i
      }
    }
  }

  return move
}

function randomMove(board: Board): number {
  const empty = board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i)
    return acc
  }, [])
  return empty[Math.floor(Math.random() * empty.length)]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

const RANDOM_CHANCE: Record<Difficulty, number> = {
  easy: 0.8,
  medium: 0.4,
  hard: 0,
}

export function getAiMove(board: Board, ai: Player, difficulty: Difficulty): number {
  if (Math.random() < RANDOM_CHANCE[difficulty]) {
    return randomMove(board)
  }
  return bestMove(board, ai)
}
