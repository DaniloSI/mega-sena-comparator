/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'

import YAML from 'yaml'

const GAMES_KEY = 'games'

function App() {
  const { 1: setSelectedFile } = useState<File | null>(null)
  const [games, setGames] = useState<number[][]>([])
  const [inputSortedTen, setInputSortedTen] = useState<string>('')
  const [result, setResult] = useState<number[][] | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)

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

      <nav className="flex gap-6" aria-label="Tabs">
        <a
          href="#"
          className={
            !activeTab
              ? 'shrink-0 rounded-lg bg-sky-100 p-2 text-sm font-medium text-sky-600'
              : 'shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }
          onClick={() => setActiveTab(0)}
        >
          Meus jogos ({games.length})
        </a>

        <a
          href="#"
          className={
            activeTab
              ? 'shrink-0 rounded-lg bg-sky-100 p-2 text-sm font-medium text-sky-600'
              : 'shrink-0 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }
          aria-current="page"
          onClick={() => setActiveTab(1)}
        >
          Comparação de resultado
        </a>
      </nav>

      <div className={activeTab ? 'hidden' : 'mt-4 flex flex-col gap-8'}>
        <div>
          <input
            type="file"
            name="input games"
            id="input-games"
            onChange={handleFileChange}
          />
        </div>

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
            <tr>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                <strong>Total</strong>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                <strong>{games.length}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={!activeTab ? 'hidden' : 'mt-4 flex flex-col gap-8'}>
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
              inputMode="decimal"
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
                      Prêmio
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      Total de Jogos Premiados
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.map(([length, amount]) => (
                    <tr key={length}>
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        {
                          {
                            6: 'Sena',
                            5: 'Quina',
                            4: 'Quadra'
                          }[length]
                        }
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
    </div>
  )
}

export default App
