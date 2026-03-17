import { useState, useCallback, useMemo } from "react";
import { BracketData, Matchup } from "../types";
import FirstFour from "./FirstFour";
import RegionBracket, { RegionPicks } from "./RegionBracket";
import FinalFour from "./FinalFour";
import PDFGenerator from "./PDFGenerator";

interface BracketPickerProps {
  data: BracketData;
  title?: string;
}

function createEmptyRegionPicks(): RegionPicks {
  return {
    r64: Array(8).fill(null),
    r32: Array(4).fill(null),
    sweet16: Array(2).fill(null),
    elite8: null,
  };
}

export default function BracketPicker({ data, title }: BracketPickerProps) {
  // First Four state
  const [firstFourPicks, setFirstFourPicks] = useState<Record<number, string>>(
    {}
  );
  const [firstFourDone, setFirstFourDone] = useState(false);

  // Region picks state
  const [regionPicks, setRegionPicks] = useState<Record<string, RegionPicks>>(
    () => {
      const init: Record<string, RegionPicks> = {};
      data.regions.forEach((r) => {
        init[r.name] = createEmptyRegionPicks();
      });
      return init;
    }
  );

  // Final Four state
  const [semifinal1Pick, setSemifinal1Pick] = useState<string | null>(null);
  const [semifinal2Pick, setSemifinal2Pick] = useState<string | null>(null);
  const [championPick, setChampionPick] = useState<string | null>(null);

  // Check if first four has any games
  const hasFirstFour = data.first_four.length > 0;
  const allFirstFourPicked =
    !hasFirstFour ||
    Object.keys(firstFourPicks).length === data.first_four.length;
  const showFullBracket = !hasFirstFour || firstFourDone;

  // Resolve matchups with First Four winners inserted
  const resolvedMatchups = useMemo(() => {
    const result: Record<string, Matchup[]> = {};
    data.regions.forEach((region) => {
      result[region.name] = region.matchups.map((m) => {
        if (m.first_four_placeholder) {
          // Find the first four game whose winner goes into this region
          const ffGame = data.first_four.find(
            (ff) => ff.winner_plays_region === region.name
          );
          if (ffGame) {
            // Find which first four game index this is
            const ffIdx = data.first_four.indexOf(ffGame);
            const winner = firstFourPicks[ffIdx];
            if (winner) {
              // Replace the placeholder bottom team with the FF winner
              return {
                ...m,
                bottom_team: winner,
                bottom_record: "",
                bottom_conference: "",
                first_four_placeholder: false,
              };
            }
          }
        }
        return m;
      });
    });
    return result;
  }, [data, firstFourPicks]);

  // Cascade clearing: when a pick changes, clear all downstream picks that had
  // the old team
  const clearDownstream = useCallback(
    (
      picks: RegionPicks,
      round: "r64" | "r32" | "sweet16" | "elite8",
      oldTeam: string
    ): RegionPicks => {
      const updated = { ...picks };

      if (round === "r64" || round === "r32" || round === "sweet16") {
        // Clear from r32 onward if needed
        if (round === "r64") {
          updated.r32 = updated.r32.map((t) => (t === oldTeam ? null : t));
        }
        if (round === "r64" || round === "r32") {
          updated.sweet16 = updated.sweet16.map((t) =>
            t === oldTeam ? null : t
          );
        }
        updated.elite8 = updated.elite8 === oldTeam ? null : updated.elite8;
      }

      return updated;
    },
    []
  );

  // Clear final four picks if a regional champion changes
  const clearFinalFourTeam = useCallback(
    (oldTeam: string) => {
      if (semifinal1Pick === oldTeam) setSemifinal1Pick(null);
      if (semifinal2Pick === oldTeam) setSemifinal2Pick(null);
      if (championPick === oldTeam) setChampionPick(null);
    },
    [semifinal1Pick, semifinal2Pick, championPick]
  );

  // Handle first four picks
  const handleFirstFourPick = useCallback(
    (gameIndex: number, team: string) => {
      setFirstFourPicks((prev) => ({ ...prev, [gameIndex]: team }));
    },
    []
  );

  // Handle region picks
  const handleR64Pick = useCallback(
    (regionName: string, matchupIndex: number, team: string) => {
      setRegionPicks((prev) => {
        const picks = { ...prev[regionName] };
        const old = picks.r64[matchupIndex];

        picks.r64 = [...picks.r64];
        picks.r64[matchupIndex] = team;

        // If changing a pick, cascade clear
        let updated = picks;
        if (old && old !== team) {
          updated = clearDownstream(picks, "r64", old);
          // Also need to clear final four if the old team propagated
          const oldElite8 = prev[regionName].elite8;
          if (oldElite8 === old) {
            clearFinalFourTeam(old);
          }
        }

        return { ...prev, [regionName]: updated };
      });
    },
    [clearDownstream, clearFinalFourTeam]
  );

  const handleR32Pick = useCallback(
    (regionName: string, matchupIndex: number, team: string) => {
      setRegionPicks((prev) => {
        const picks = { ...prev[regionName] };
        const old = picks.r32[matchupIndex];

        picks.r32 = [...picks.r32];
        picks.r32[matchupIndex] = team;

        let updated = picks;
        if (old && old !== team) {
          updated = clearDownstream(picks, "r32", old);
          if (prev[regionName].elite8 === old) {
            clearFinalFourTeam(old);
          }
        }

        return { ...prev, [regionName]: updated };
      });
    },
    [clearDownstream, clearFinalFourTeam]
  );

  const handleSweet16Pick = useCallback(
    (regionName: string, matchupIndex: number, team: string) => {
      setRegionPicks((prev) => {
        const picks = { ...prev[regionName] };
        const old = picks.sweet16[matchupIndex];

        picks.sweet16 = [...picks.sweet16];
        picks.sweet16[matchupIndex] = team;

        let updated = picks;
        if (old && old !== team) {
          updated = clearDownstream(picks, "sweet16", old);
          if (prev[regionName].elite8 === old) {
            clearFinalFourTeam(old);
          }
        }

        return { ...prev, [regionName]: updated };
      });
    },
    [clearDownstream, clearFinalFourTeam]
  );

  const handleElite8Pick = useCallback(
    (regionName: string, team: string) => {
      setRegionPicks((prev) => {
        const picks = { ...prev[regionName] };
        const old = picks.elite8;

        picks.elite8 = team;

        if (old && old !== team) {
          clearFinalFourTeam(old);
        }

        return { ...prev, [regionName]: picks };
      });
    },
    [clearFinalFourTeam]
  );

  const handleSemifinal1Pick = useCallback(
    (team: string) => {
      const old = semifinal1Pick;
      setSemifinal1Pick(team);
      if (old && old !== team && championPick === old) {
        setChampionPick(null);
      }
    },
    [semifinal1Pick, championPick]
  );

  const handleSemifinal2Pick = useCallback(
    (team: string) => {
      const old = semifinal2Pick;
      setSemifinal2Pick(team);
      if (old && old !== team && championPick === old) {
        setChampionPick(null);
      }
    },
    [semifinal2Pick, championPick]
  );

  const handleChampionPick = useCallback((team: string) => {
    setChampionPick(team);
  }, []);

  // Region champions for Final Four
  const regionChampions: Record<string, string | null> = {};
  data.regions.forEach((r) => {
    regionChampions[r.name] = regionPicks[r.name]?.elite8 ?? null;
  });

  // Progress tracking
  const totalR64Picks = data.regions.reduce(
    (sum, r) => sum + regionPicks[r.name].r64.filter((p) => p !== null).length,
    0
  );
  const totalR32Picks = data.regions.reduce(
    (sum, r) => sum + regionPicks[r.name].r32.filter((p) => p !== null).length,
    0
  );
  const totalS16Picks = data.regions.reduce(
    (sum, r) =>
      sum + regionPicks[r.name].sweet16.filter((p) => p !== null).length,
    0
  );
  const totalE8Picks = data.regions.reduce(
    (sum, r) => sum + (regionPicks[r.name].elite8 ? 1 : 0),
    0
  );
  const totalFinalPicks =
    (semifinal1Pick ? 1 : 0) +
    (semifinal2Pick ? 1 : 0) +
    (championPick ? 1 : 0);
  const totalPicks =
    totalR64Picks + totalR32Picks + totalS16Picks + totalE8Picks + totalFinalPicks;
  const maxPicks = 32 + 16 + 8 + 4 + 3; // 63

  if (!showFullBracket) {
    return (
      <FirstFour
        games={data.first_four}
        picks={firstFourPicks}
        onPick={handleFirstFourPick}
        onContinue={() => setFirstFourDone(true)}
        allPicked={allFirstFourPicked}
      />
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-6 px-4 shadow-lg mb-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                🏀 {title ? `${title} ` : ""}March Madness 2026 Bracket 🏀
              </h1>
              <p className="text-blue-200 mt-1">
                Click teams to advance them through the tournament!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold">{totalPicks}</div>
                <div className="text-xs text-blue-200">of {maxPicks} picks</div>
              </div>
              <div className="w-32 bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(totalPicks / maxPicks) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 space-y-6">
        {/* Regions in a 2x2 grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.regions.map((region) => (
            <RegionBracket
              key={region.name}
              region={region}
              picks={regionPicks[region.name]}
              resolvedMatchups={resolvedMatchups[region.name]}
              onPickR64={(idx, team) => handleR64Pick(region.name, idx, team)}
              onPickR32={(idx, team) => handleR32Pick(region.name, idx, team)}
              onPickSweet16={(idx, team) =>
                handleSweet16Pick(region.name, idx, team)
              }
              onPickElite8={(team) => handleElite8Pick(region.name, team)}
            />
          ))}
        </div>

        {/* Final Four */}
        <FinalFour
          finalFour={data.final_four}
          regionChampions={regionChampions}
          semifinal1Pick={semifinal1Pick}
          semifinal2Pick={semifinal2Pick}
          championPick={championPick}
          onPickSemifinal1={handleSemifinal1Pick}
          onPickSemifinal2={handleSemifinal2Pick}
          onPickChampion={handleChampionPick}
        />

        {/* PDF Generator */}
        <div className="py-4">
          <PDFGenerator
            data={data}
            regionPicks={regionPicks}
            semifinal1Pick={semifinal1Pick}
            semifinal2Pick={semifinal2Pick}
            championPick={championPick}
            firstFourPicks={firstFourPicks}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm pb-4 flex items-center justify-center gap-2">
          <span>Made with 🏀 by Sunil Sadasivan for March Madness 2026</span>
          <a href="https://github.com/sunil-sadasivan/march-madness-bracket" target="_blank" rel="noopener noreferrer" className="inline-block opacity-40 hover:opacity-70 transition-opacity">
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
