import confetti from "canvas-confetti";
import { FinalFourSetup } from "../types";

interface FinalFourProps {
  finalFour: FinalFourSetup;
  regionChampions: Record<string, string | null>;
  semifinal1Pick: string | null;
  semifinal2Pick: string | null;
  championPick: string | null;
  onPickSemifinal1: (team: string) => void;
  onPickSemifinal2: (team: string) => void;
  onPickChampion: (team: string) => void;
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"],
  });
}

function fireChampionConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#f59e0b", "#ef4444", "#3b82f6"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#10b981", "#8b5cf6", "#f59e0b"],
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

function TeamButton({
  team,
  isPicked,
  isClickable,
  onClick,
  color,
}: {
  team: string | null;
  isPicked: boolean;
  isClickable: boolean;
  onClick?: () => void;
  color: string;
}) {
  if (!team) {
    return (
      <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-center">
        Waiting for Regional Champion...
      </div>
    );
  }

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`w-full px-4 py-3 rounded-xl border-2 text-center font-semibold transition-all team-slot ${
        isPicked
          ? "text-white shadow-lg picked scale-105"
          : isClickable
            ? "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer bg-white"
            : "border-gray-200 bg-gray-50 cursor-default text-gray-500"
      }`}
      style={
        isPicked
          ? { backgroundColor: color, borderColor: color }
          : {}
      }
    >
      🏀 {team}
    </button>
  );
}

export default function FinalFour({
  finalFour,
  regionChampions,
  semifinal1Pick,
  semifinal2Pick,
  championPick,
  onPickSemifinal1,
  onPickSemifinal2,
  onPickChampion,
}: FinalFourProps) {
  const semi1TeamA = regionChampions[finalFour.semifinal_1[0]] ?? null;
  const semi1TeamB = regionChampions[finalFour.semifinal_1[1]] ?? null;
  const semi2TeamA = regionChampions[finalFour.semifinal_2[0]] ?? null;
  const semi2TeamB = regionChampions[finalFour.semifinal_2[1]] ?? null;

  const handleSemifinal1 = (team: string) => {
    onPickSemifinal1(team);
    fireConfetti();
  };

  const handleSemifinal2 = (team: string) => {
    onPickSemifinal2(team);
    fireConfetti();
  };

  const handleChampion = (team: string) => {
    onPickChampion(team);
    fireChampionConfetti();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-400">
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-6 py-4 text-white text-center">
        <h2 className="text-2xl font-extrabold">🏆 Final Four & Championship 🏆</h2>
        <p className="text-sm opacity-80 mt-1">
          {finalFour.championship_location} &mdash;{" "}
          {finalFour.championship_date}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Semifinal 1 */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Semifinal 1
              </div>
              <div className="text-xs text-gray-500">
                {finalFour.semifinal_1[0]} vs {finalFour.semifinal_1[1]}
              </div>
            </div>
            <TeamButton
              team={semi1TeamA}
              isPicked={semifinal1Pick === semi1TeamA}
              isClickable={!!semi1TeamA}
              onClick={() => semi1TeamA && handleSemifinal1(semi1TeamA)}
              color="#2563eb"
            />
            <div className="text-center text-gray-400 font-bold text-xs">
              VS
            </div>
            <TeamButton
              team={semi1TeamB}
              isPicked={semifinal1Pick === semi1TeamB}
              isClickable={!!semi1TeamB}
              onClick={() => semi1TeamB && handleSemifinal1(semi1TeamB)}
              color="#dc2626"
            />
          </div>

          {/* Championship */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                Championship Game
              </div>
            </div>
            <TeamButton
              team={semifinal1Pick}
              isPicked={championPick === semifinal1Pick}
              isClickable={!!semifinal1Pick}
              onClick={() =>
                semifinal1Pick && handleChampion(semifinal1Pick)
              }
              color="#7c3aed"
            />
            <div className="text-center text-yellow-500 font-bold text-lg">
              🏆
            </div>
            <TeamButton
              team={semifinal2Pick}
              isPicked={championPick === semifinal2Pick}
              isClickable={!!semifinal2Pick}
              onClick={() =>
                semifinal2Pick && handleChampion(semifinal2Pick)
              }
              color="#7c3aed"
            />

            {/* Champion display */}
            {championPick && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl text-center animate-bounce-in shadow-xl">
                <div className="text-3xl animate-trophy-bounce">🏆</div>
                <div className="text-white font-extrabold text-xl mt-1">
                  {championPick}
                </div>
                <div className="text-white/80 text-xs mt-1">
                  2026 National Champion!
                </div>
              </div>
            )}
          </div>

          {/* Semifinal 2 */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Semifinal 2
              </div>
              <div className="text-xs text-gray-500">
                {finalFour.semifinal_2[0]} vs {finalFour.semifinal_2[1]}
              </div>
            </div>
            <TeamButton
              team={semi2TeamA}
              isPicked={semifinal2Pick === semi2TeamA}
              isClickable={!!semi2TeamA}
              onClick={() => semi2TeamA && handleSemifinal2(semi2TeamA)}
              color="#16a34a"
            />
            <div className="text-center text-gray-400 font-bold text-xs">
              VS
            </div>
            <TeamButton
              team={semi2TeamB}
              isPicked={semifinal2Pick === semi2TeamB}
              isClickable={!!semi2TeamB}
              onClick={() => semi2TeamB && handleSemifinal2(semi2TeamB)}
              color="#ea580c"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
