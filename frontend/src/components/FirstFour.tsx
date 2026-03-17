import { FirstFourGame } from "../types";

interface FirstFourProps {
  games: FirstFourGame[];
  picks: Record<number, string>;
  onPick: (gameIndex: number, team: string) => void;
  onContinue: () => void;
  allPicked: boolean;
  title?: string;
  isWbb?: boolean;
}

export default function FirstFour({
  games,
  picks,
  onPick,
  onContinue,
  allPicked,
  title,
  isWbb,
}: FirstFourProps) {
  const basePath = window.location.pathname.includes("/march-madness-bracket") ? "/march-madness-bracket" : "";
  const switchUrl = isWbb ? `${basePath}/` : `${basePath}/wbb`;
  const switchLabel = isWbb ? "Switch to Men's Bracket →" : "Switch to Women's Bracket →";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          🏀 {title ? `${title} ` : ""}First Four 🏀
        </h1>
        <p className="text-lg text-gray-600">
          Pick the winners of the play-in games to fill out your bracket!
        </p>
        <div className="mt-2 text-sm text-gray-500">
          {Object.keys(picks).length} of {games.length} games picked
        </div>
        <a
          href={switchUrl}
          className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
        >
          {switchLabel}
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, idx) => {
          const picked = picks[idx];
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-yellow-300 transition-colors animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm uppercase tracking-wide">
                    Play-In Game {idx + 1}
                  </span>
                  <span className="text-xs bg-white/20 rounded-full px-3 py-1">
                    #{game.seed} Seed
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <button
                  onClick={() => onPick(idx, game.team_a)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all team-slot ${
                    picked === game.team_a
                      ? "border-green-500 bg-green-50 picked shadow-md"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      🏀 {game.team_a}
                    </span>
                    {picked === game.team_a && (
                      <span className="text-green-600 text-xl animate-bounce-in">
                        ✅
                      </span>
                    )}
                  </div>
                </button>

                <div className="text-center text-gray-400 font-bold text-sm">
                  VS
                </div>

                <button
                  onClick={() => onPick(idx, game.team_b)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all team-slot ${
                    picked === game.team_b
                      ? "border-green-500 bg-green-50 picked shadow-md"
                      : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      🏀 {game.team_b}
                    </span>
                    {picked === game.team_b && (
                      <span className="text-green-600 text-xl animate-bounce-in">
                        ✅
                      </span>
                    )}
                  </div>
                </button>
              </div>

              <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Winner plays #{game.winner_plays_seed} {game.winner_plays_team}{" "}
                in {game.winner_plays_region}
              </div>
            </div>
          );
        })}
      </div>

      {allPicked && (
        <div className="text-center mt-8 animate-bounce-in">
          <button
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Continue to Full Bracket →
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm pt-8 pb-4 flex items-center justify-center gap-2">
        <span>Made with 🏀 by Sunil Sadasivan for March Madness 2026</span>
        <a href="https://github.com/sunil-sadasivan/march-madness-bracket" target="_blank" rel="noopener noreferrer" className="inline-block opacity-40 hover:opacity-70 transition-opacity">
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        </a>
      </div>
    </div>
  );
}
