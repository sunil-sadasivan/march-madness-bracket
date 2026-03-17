import { FirstFourGame } from "../types";

interface FirstFourProps {
  games: FirstFourGame[];
  picks: Record<number, string>;
  onPick: (gameIndex: number, team: string) => void;
  onContinue: () => void;
  allPicked: boolean;
}

export default function FirstFour({
  games,
  picks,
  onPick,
  onContinue,
  allPicked,
}: FirstFourProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          🏀 First Four 🏀
        </h1>
        <p className="text-lg text-gray-600">
          Pick the winners of the play-in games to fill out your bracket!
        </p>
        <div className="mt-2 text-sm text-gray-500">
          {Object.keys(picks).length} of {games.length} games picked
        </div>
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
    </div>
  );
}
