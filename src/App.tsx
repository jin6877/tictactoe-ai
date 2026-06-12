import { useEffect, useState } from 'react'
import {
  getAiMove,
  getWinner,
  isDraw,
  isGameOver,
  type Board,
  type Difficulty,
} from './minimax'

const EMPTY_BOARD: Board = Array(9).fill(null)

type Stats = { wins: number; losses: number; draws: number }

const STATS_KEY = 'tictactoe-stats'

function loadStats(): Stats {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore corrupted data
  }
  return { wins: 0, losses: 0, draws: 0 }
}

function App() {
  const [board, setBoard] = useState<Board>(EMPTY_BOARD)
  const [difficulty, setDifficulty] = useState<Difficulty>('hard')
  const [turn, setTurn] = useState<'player' | 'ai'>('player')
  const [stats, setStats] = useState<Stats>(loadStats)
  const [recorded, setRecorded] = useState(false)

  const winner = getWinner(board)
  const draw = isDraw(board)

  useEffect(() => {
    if (recorded || !isGameOver(board)) return

    setStats((prev) => {
      const next = { ...prev }
      if (winner === 'X') next.wins++
      else if (winner === 'O') next.losses++
      else next.draws++
      localStorage.setItem(STATS_KEY, JSON.stringify(next))
      return next
    })
    setRecorded(true)
  }, [board, winner, recorded])

  useEffect(() => {
    if (turn !== 'ai' || isGameOver(board)) return

    const timer = setTimeout(() => {
      const move = getAiMove(board, 'O', difficulty)
      const next = [...board]
      next[move] = 'O'
      setBoard(next)
      setTurn('player')
    }, 400)

    return () => clearTimeout(timer)
  }, [turn, board, difficulty])

  function handleClick(index: number) {
    if (board[index] || turn !== 'player' || isGameOver(board)) return
    const next = [...board]
    next[index] = 'X'
    setBoard(next)
    setTurn('ai')
  }

  function reset() {
    setBoard(EMPTY_BOARD)
    setTurn('player')
    setRecorded(false)
  }

  function resetStats() {
    const empty = { wins: 0, losses: 0, draws: 0 }
    setStats(empty)
    localStorage.setItem(STATS_KEY, JSON.stringify(empty))
  }

  let status: string
  if (winner === 'X') status = '🎉 You win!'
  else if (winner === 'O') status = '🤖 AI wins!'
  else if (draw) status = "🤝 It's a draw!"
  else status = turn === 'player' ? 'Your turn (X)' : 'AI is thinking...'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-900 text-white px-4">
      <h1 className="text-3xl font-bold">Tic-Tac-Toe vs Minimax AI</h1>

      <div className="flex gap-2">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              setDifficulty(level)
              reset()
            }}
            className={`px-3 py-1 rounded-md capitalize text-sm transition-colors ${
              difficulty === level
                ? 'bg-emerald-500 text-slate-900 font-semibold'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <span className="text-emerald-400">Wins {stats.wins}</span>
        <span className="text-rose-400">Losses {stats.losses}</span>
        <span className="text-slate-400">Draws {stats.draws}</span>
        <button
          onClick={resetStats}
          className="text-slate-500 hover:text-slate-300 underline transition-colors"
        >
          reset
        </button>
      </div>

      <p className="text-lg h-7">{status}</p>

      <div className="grid grid-cols-3 gap-2 w-72">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={!!cell || turn !== 'player' || isGameOver(board)}
            className="aspect-square bg-slate-800 rounded-lg text-5xl font-bold flex items-center justify-center hover:bg-slate-700 disabled:hover:bg-slate-800 transition-colors"
          >
            <span className={cell === 'X' ? 'text-sky-400' : 'text-rose-400'}>
              {cell}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        New Game
      </button>
    </div>
  )
}

export default App
