/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'

import YAML from 'yaml'

const GAMES_KEY = 'games'

function App() {
  const { 1: setSelectedFile } = useState<File | null>(null)
  const [games, setGames] = useState<number[][]>([])
  const [inputSortedTen, setInputSortedTen] = useState<string>('')
  const [result, setResult] = useState<number[][] | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    setSelectedFile(file)

    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        const yamlString = (e.target?.result ?? '') as string
        const newGames = YAML.parse(yamlString)

        setGames(newGames)

        localStorage.setItem(GAMES_KEY, JSON.stringify(newGames))
      }

      reader.readAsText(file)
    }
  }

  useEffect(() => {
    const gamesCache = localStorage.getItem(GAMES_KEY)

    if (gamesCache) {
      setGames(JSON.parse(gamesCache))
    }
  }, [])

  const gamesConfig = useMemo(() => {
    const config = new Map<number, number>()

    for (const game of games) {
      const currentValue = config.get(game.length) ?? 0
      config.set(game.length, currentValue + 1)
    }

    return config
  }, [games])

  function compareResult() {
    const sortedTen = new Set(
      inputSortedTen
        .replaceAll(' ', '')
        .split(',')
        .map((ten) => parseInt(ten))
    )

    const result = new Map<number, number>()

    for (const game of games) {
      const matches = sortedTen.intersection(new Set(game))

      if (matches.size > 3) {
        const currentValue = result.get(matches.size) ?? 0
        result.set(matches.size, currentValue + 1)
      }
    }

    setResult(Array.from(result.entries()))
  }

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden bg-white px-4">
      <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900">
        Loteria
      </h1>

      <div>
        <input
          type="file"
          name="input games"
          id="input-games"
          onChange={handleFileChange}
        />
      </div>

      <div>
        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 p-4 text-gray-900">
            <h2 className="font-medium">Quantidade de jogos: {games.length}</h2>

            <svg
              className="size-5 shrink-0 transition duration-300 group-open:-rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>

          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="ltr:text-left rtl:text-right">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Quantidade de dezenas
                </th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                  Quantidade de jogos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(gamesConfig.entries())
                .sort(([a], [b]) => b - a)
                .map(([length, amount]) => (
                  <tr key={length}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {length.toString().padStart(2, '0')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {amount}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </details>
      </div>

      <div>
        <label
          htmlFor="InputResult"
          className="block overflow-hidden rounded-md border border-gray-200 px-3 py-2 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
        >
          <span className="text-xs font-medium text-gray-700">
            Dezenas sorteadas
          </span>

          <input
            type="text"
            id="InputResult"
            placeholder="Ex.: 1, 2, 3, 4, 5, 6"
            className="mt-1 w-full border-none p-0 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
            onChange={(e) => setInputSortedTen(e.target.value)}
            value={inputSortedTen}
          />
        </label>
      </div>

      <div className="w-full">
        <div className="m-auto w-fit">
          <button
            type="button"
            onClick={compareResult}
            className="inline-block rounded border border-indigo-600 px-12 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500"
          >
            Comparar resultado
          </button>
        </div>
      </div>

      {result && (
        <div>
          <h3 className="mb-2 text-center text-2xl font-bold tracking-tight text-gray-900">
            Resultado
          </h3>

          {result.length > 0 ? (
            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
              <thead className="ltr:text-left rtl:text-right">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    Qtd de Dezenas
                  </th>
                  <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                    Qtd de Acertos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.map(([length, amount]) => (
                  <tr key={length}>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {length}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">Não houve acertos :(</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
