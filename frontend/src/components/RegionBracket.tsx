import { Region, Matchup } from "../types";

interface RegionPicks {
  r64: (string | null)[];
  r32: (string | null)[];
  sweet16: (string | null)[];
  elite8: string | null;
}

interface RegionBracketProps {
  region: Region;
  picks: RegionPicks;
  onPickR64: (matchupIndex: number, team: string) => void;
  onPickR32: (matchupIndex: number, team: string) => void;
  onPickSweet16: (matchupIndex: number, team: string) => void;
  onPickElite8: (team: string) => void;
  resolvedMatchups: Matchup[];
}

function seedEmoji(seed: number): string {
  if (seed <= 4) return " 🏀";
  return "";
}

function TeamSlot({
  seed,
  team,
  isClickable,
  isPicked,
  onClick,
  regionColor,
}: {
  seed: number | null;
  team: string | null;
  isClickable: boolean;
  isPicked: boolean;
  onClick?: () => void;
  regionColor: string;
}) {
  if (!team) {
    return (
      <div className="h-9 px-2 py-1 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center text-gray-400 text-xs">
        <span className="text-gray-300 mr-1 font-mono w-5 text-right">--</span>
        <span>---</span>
      </div>
    );
  }

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`h-9 w-full px-2 py-1 border rounded flex items-center text-xs transition-all team-slot truncate ${
        isPicked
          ? "border-2 font-bold shadow-sm picked"
          : isClickable
            ? "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            : "border-gray-200 bg-gray-50 cursor-default"
      }`}
      style={
        isPicked
          ? { borderColor: regionColor, backgroundColor: regionColor + "15" }
          : {}
      }
    >
      <span className="font-mono w-5 text-right mr-1 text-gray-500 shrink-0">
        {seed ?? "?"}
      </span>
      <span className="truncate">
        {team}
        {seed !== null ? seedEmoji(seed) : ""}
      </span>
    </button>
  );
}

export default function RegionBracket({
  region,
  picks,
  onPickR64,
  onPickR32,
  onPickSweet16,
  onPickElite8,
  resolvedMatchups,
}: RegionBracketProps) {
  // Build the data for each round
  // Round of 64: 8 matchups from region data
  const r64Matchups = resolvedMatchups;

  // Determine seeds that advance
  function getR64Winner(
    matchupIdx: number
  ): { seed: number; team: string } | null {
    const pick = picks.r64[matchupIdx];
    if (!pick) return null;
    const m = r64Matchups[matchupIdx];
    if (!m) return null;
    if (pick === m.top_team) return { seed: m.top_seed, team: m.top_team };
    if (pick === m.bottom_team)
      return { seed: m.bottom_seed, team: m.bottom_team };
    return null;
  }

  function getR32Winner(
    matchupIdx: number
  ): { seed: number; team: string } | null {
    const pick = picks.r32[matchupIdx];
    if (!pick) return null;
    // figure out seed from the two r64 winners feeding this
    const top = getR64Winner(matchupIdx * 2);
    const bottom = getR64Winner(matchupIdx * 2 + 1);
    if (top && pick === top.team) return top;
    if (bottom && pick === bottom.team) return bottom;
    return null;
  }

  function getSweet16Winner(
    matchupIdx: number
  ): { seed: number; team: string } | null {
    const pick = picks.sweet16[matchupIdx];
    if (!pick) return null;
    const top = getR32Winner(matchupIdx * 2);
    const bottom = getR32Winner(matchupIdx * 2 + 1);
    if (top && pick === top.team) return top;
    if (bottom && pick === bottom.team) return bottom;
    return null;
  }

  function getElite8Winner(): { seed: number; team: string } | null {
    if (!picks.elite8) return null;
    const top = getSweet16Winner(0);
    const bottom = getSweet16Winner(1);
    if (top && picks.elite8 === top.team) return top;
    if (bottom && picks.elite8 === bottom.team) return bottom;
    return null;
  }

  const regionColor = region.color;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Region header */}
      <div
        className="px-4 py-3 text-white font-bold text-lg flex items-center justify-between"
        style={{ backgroundColor: regionColor }}
      >
        <span>
          {region.name} Region
        </span>
        <span className="text-xs font-normal opacity-80">
          {region.location}
        </span>
      </div>

      {/* Bracket grid: 4 columns */}
      <div className="p-3 overflow-x-auto">
        <div className="flex gap-3 min-w-[700px]">
          {/* Column 1: Round of 64 (8 matchups) */}
          <div className="flex flex-col justify-around flex-1 gap-1 min-w-[160px]">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              Round of 64
            </div>
            {r64Matchups.map((m, idx) => (
              <div key={idx} className="flex flex-col gap-0.5 mb-1">
                <TeamSlot
                  seed={m.top_seed}
                  team={m.top_team}
                  isClickable={true}
                  isPicked={picks.r64[idx] === m.top_team}
                  onClick={() => onPickR64(idx, m.top_team)}
                  regionColor={regionColor}
                />
                <TeamSlot
                  seed={m.bottom_seed}
                  team={m.bottom_team}
                  isClickable={true}
                  isPicked={picks.r64[idx] === m.bottom_team}
                  onClick={() => onPickR64(idx, m.bottom_team)}
                  regionColor={regionColor}
                />
                {idx < r64Matchups.length - 1 && (
                  <div className="h-1" />
                )}
              </div>
            ))}
          </div>

          {/* Column 2: Round of 32 (4 matchups) */}
          <div className="flex flex-col justify-around flex-1 min-w-[160px]">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              Round of 32
            </div>
            {[0, 1, 2, 3].map((idx) => {
              const topWinner = getR64Winner(idx * 2);
              const bottomWinner = getR64Winner(idx * 2 + 1);
              return (
                <div key={idx} className="flex flex-col gap-0.5 my-3">
                  <TeamSlot
                    seed={topWinner?.seed ?? null}
                    team={topWinner?.team ?? null}
                    isClickable={!!topWinner}
                    isPicked={
                      !!topWinner && picks.r32[idx] === topWinner.team
                    }
                    onClick={() => topWinner && onPickR32(idx, topWinner.team)}
                    regionColor={regionColor}
                  />
                  <TeamSlot
                    seed={bottomWinner?.seed ?? null}
                    team={bottomWinner?.team ?? null}
                    isClickable={!!bottomWinner}
                    isPicked={
                      !!bottomWinner && picks.r32[idx] === bottomWinner.team
                    }
                    onClick={() =>
                      bottomWinner && onPickR32(idx, bottomWinner.team)
                    }
                    regionColor={regionColor}
                  />
                </div>
              );
            })}
          </div>

          {/* Column 3: Sweet 16 (2 matchups) */}
          <div className="flex flex-col justify-around flex-1 min-w-[160px]">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              Sweet 16
            </div>
            {[0, 1].map((idx) => {
              const topWinner = getR32Winner(idx * 2);
              const bottomWinner = getR32Winner(idx * 2 + 1);
              return (
                <div key={idx} className="flex flex-col gap-0.5 my-8">
                  <TeamSlot
                    seed={topWinner?.seed ?? null}
                    team={topWinner?.team ?? null}
                    isClickable={!!topWinner}
                    isPicked={
                      !!topWinner && picks.sweet16[idx] === topWinner.team
                    }
                    onClick={() =>
                      topWinner && onPickSweet16(idx, topWinner.team)
                    }
                    regionColor={regionColor}
                  />
                  <TeamSlot
                    seed={bottomWinner?.seed ?? null}
                    team={bottomWinner?.team ?? null}
                    isClickable={!!bottomWinner}
                    isPicked={
                      !!bottomWinner && picks.sweet16[idx] === bottomWinner.team
                    }
                    onClick={() =>
                      bottomWinner && onPickSweet16(idx, bottomWinner.team)
                    }
                    regionColor={regionColor}
                  />
                </div>
              );
            })}
          </div>

          {/* Column 4: Elite 8 (1 matchup = regional champion) */}
          <div className="flex flex-col justify-center flex-1 min-w-[160px]">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              Elite 8
            </div>
            <div className="flex flex-col gap-0.5">
              {(() => {
                const topWinner = getSweet16Winner(0);
                const bottomWinner = getSweet16Winner(1);
                return (
                  <>
                    <TeamSlot
                      seed={topWinner?.seed ?? null}
                      team={topWinner?.team ?? null}
                      isClickable={!!topWinner}
                      isPicked={
                        !!topWinner && picks.elite8 === topWinner.team
                      }
                      onClick={() =>
                        topWinner && onPickElite8(topWinner.team)
                      }
                      regionColor={regionColor}
                    />
                    <TeamSlot
                      seed={bottomWinner?.seed ?? null}
                      team={bottomWinner?.team ?? null}
                      isClickable={!!bottomWinner}
                      isPicked={
                        !!bottomWinner && picks.elite8 === bottomWinner.team
                      }
                      onClick={() =>
                        bottomWinner && onPickElite8(bottomWinner.team)
                      }
                      regionColor={regionColor}
                    />
                  </>
                );
              })()}
            </div>
            {/* Regional champion display */}
            {picks.elite8 && (
              <div
                className="mt-3 px-3 py-2 rounded-xl text-white text-center font-bold text-sm animate-bounce-in shadow-md"
                style={{ backgroundColor: regionColor }}
              >
                👑 {picks.elite8}
                <div className="text-[10px] font-normal opacity-80">
                  {region.name} Champion
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { RegionPicks };
