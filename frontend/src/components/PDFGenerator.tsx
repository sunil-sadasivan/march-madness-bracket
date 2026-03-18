import jsPDF from "jspdf";
import { BracketData } from "../types";
import { RegionPicks } from "./RegionBracket";

interface PDFGeneratorProps {
  data: BracketData;
  regionPicks: Record<string, RegionPicks>;
  semifinal1Pick: string | null;
  semifinal2Pick: string | null;
  championPick: string | null;
  firstFourPicks: Record<number, string>;
}

// ===== LAYOUT CONSTANTS =====
const PW = 297, PH = 210;
const SW = 24, SH = 4.2;
const CG = 2.8;
const RG = 5;
const HEADER_H = 14;
const BOTTOM_M = 5;

// ===== DRAWING PRIMITIVES =====
function ln(doc: jsPDF, x1: number, y1: number, x2: number, y2: number) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.line(x1, y1, x2, y2);
}

function drawSlot(doc: jsPDF, x: number, y: number, label: string, bold: boolean) {
  doc.setDrawColor(0);
  doc.setLineWidth(bold ? 0.4 : 0.15);
  const bottomY = y + SH;
  doc.line(x, bottomY, x + SW, bottomY);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setTextColor(0);
  const maxChars = Math.floor(SW / 2);
  const text = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
  doc.text(text, x + 0.5, bottomY - 0.8);
}

function drawEmptySlot(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(160);
  doc.setLineWidth(0.1);
  doc.line(x, y + SH, x + SW, y + SH);
}

function drawConnector(
  doc: jsPDF,
  slotX: number, topSlotY: number, botSlotY: number,
  nextSlotX: number, targetY: number,
  flowRight: boolean
) {
  const topLine = topSlotY + SH;
  const botLine = botSlotY + SH;

  if (flowRight) {
    const rightEdge = slotX + SW;
    const bx = rightEdge + CG * 0.45;
    ln(doc, rightEdge, topLine, bx, topLine);
    ln(doc, rightEdge, botLine, bx, botLine);
    ln(doc, bx, topLine, bx, botLine);
    ln(doc, bx, targetY, nextSlotX, targetY);
  } else {
    const leftEdge = slotX;
    const bx = leftEdge - CG * 0.45;
    ln(doc, leftEdge, topLine, bx, topLine);
    ln(doc, leftEdge, botLine, bx, botLine);
    ln(doc, bx, topLine, bx, botLine);
    ln(doc, bx, targetY, nextSlotX + SW, targetY);
  }
}

// ===== POSITIONS =====
function getColX(): number[] {
  const unit = SW + CG;
  const cx = PW / 2 - SW / 2;
  const c: number[] = new Array(11);
  for (let i = 0; i <= 4; i++) c[i] = cx - (5 - i) * unit;
  c[5] = cx;
  for (let i = 6; i <= 10; i++) c[i] = cx + (i - 5) * unit;
  return c;
}

function getR64Y(): number[] {
  const availH = PH - HEADER_H - BOTTOM_M - RG;
  const step = availH / 32;
  const y: number[] = [];
  for (let i = 0; i < 16; i++) y.push(HEADER_H + i * step);
  for (let i = 0; i < 16; i++) y.push(HEADER_H + 16 * step + RG + i * step);
  return y;
}

function nextRoundY(prev: number[]): number[] {
  const r: number[] = [];
  for (let i = 0; i < prev.length; i += 2) {
    const topBottom = prev[i] + SH;
    const botBottom = prev[i + 1] + SH;
    const mid = (topBottom + botBottom) / 2;
    r.push(mid - SH);
  }
  return r;
}

// ===== SLOT DATA =====
interface Slot { label: string; bold: boolean; }

function buildSide(
  data: BracketData,
  topRegName: string, botRegName: string,
  regionPicks: Record<string, RegionPicks>,
  firstFourPicks: Record<number, string>,
  semiWinner: string | null
) {
  // Resolve matchups with first four picks
  const resolved: Record<string, Array<{ ts: number; tt: string; bs: number; bt: string }>> = {};
  for (const rn of [topRegName, botRegName]) {
    const region = data.regions.find(r => r.name === rn)!;
    resolved[rn] = region.matchups.map(m => {
      let bt = m.bottom_team;
      if (m.first_four_placeholder) {
        const ff = data.first_four.find(f => f.winner_plays_region === rn && f.winner_plays_seed === m.bottom_seed);
        if (ff) {
          const idx = data.first_four.indexOf(ff);
          bt = firstFourPicks[idx] || bt;
        }
      }
      return { ts: m.top_seed, tt: m.top_team, bs: m.bottom_seed, bt };
    });
  }

  const seeds = new Map<string, number>();
  for (const rn of [topRegName, botRegName]) {
    for (const m of resolved[rn]) {
      seeds.set(m.tt, m.ts);
      seeds.set(m.bt, m.bs);
    }
  }
  const sl = (t: string | null) => t ? `${seeds.get(t) ?? "?"} ${t}` : "";

  const buildReg = (rn: string) => {
    const ms = resolved[rn];
    const p = regionPicks[rn] || { r64: Array(8).fill(null), r32: Array(4).fill(null), sweet16: Array(2).fill(null), elite8: null };

    const r64: Slot[] = [];
    for (let i = 0; i < 8; i++) {
      r64.push({ label: sl(ms[i].tt), bold: p.r64[i] === ms[i].tt });
      r64.push({ label: sl(ms[i].bt), bold: p.r64[i] === ms[i].bt });
    }
    const r32: Slot[] = [];
    for (let i = 0; i < 8; i++) {
      const t = p.r64[i];
      r32.push({ label: t ? sl(t) : "", bold: !!(t && p.r32[Math.floor(i / 2)] === t) });
    }
    const s16: Slot[] = [];
    for (let i = 0; i < 4; i++) {
      const t = p.r32[i];
      s16.push({ label: t ? sl(t) : "", bold: !!(t && p.sweet16[Math.floor(i / 2)] === t) });
    }
    const e8: Slot[] = [];
    for (let i = 0; i < 2; i++) {
      const t = p.sweet16[i];
      e8.push({ label: t ? sl(t) : "", bold: !!(t && p.elite8 === t) });
    }
    return { r64, r32, s16, e8, elite8: p.elite8 };
  };

  const top = buildReg(topRegName);
  const bot = buildReg(botRegName);

  return {
    r64: [...top.r64, ...bot.r64],
    r32: [...top.r32, ...bot.r32],
    s16: [...top.s16, ...bot.s16],
    e8: [...top.e8, ...bot.e8],
    semi: [
      { label: top.elite8 ? sl(top.elite8) : "", bold: !!(top.elite8 && semiWinner === top.elite8) } as Slot,
      { label: bot.elite8 ? sl(bot.elite8) : "", bold: !!(bot.elite8 && semiWinner === bot.elite8) } as Slot,
    ],
  };
}

function drawSide(
  doc: jsPDF,
  cols: number[],
  slots: Slot[][],
  ys: number[][],
  flowRight: boolean,
) {
  for (let round = 0; round < 5; round++) {
    const cx = cols[round];
    for (let i = 0; i < slots[round].length; i++) {
      const s = slots[round][i];
      if (s.label) {
        drawSlot(doc, cx, ys[round][i], s.label, s.bold);
      } else {
        drawEmptySlot(doc, cx, ys[round][i]);
      }
    }
  }

  for (let round = 0; round < 4; round++) {
    const cx = cols[round];
    const nextCx = cols[round + 1];
    const roundYs = ys[round];
    const nextYs = ys[round + 1];

    for (let j = 0; j < roundYs.length; j += 2) {
      const nextIdx = j / 2;
      const targetY = nextYs[nextIdx] + SH;
      drawConnector(doc, cx, roundYs[j], roundYs[j + 1], nextCx, targetY, flowRight);
    }
  }
}

// ===== COMPONENT =====
export default function PDFGenerator({
  data,
  regionPicks,
  semifinal1Pick,
  semifinal2Pick,
  championPick,
  firstFourPicks,
}: PDFGeneratorProps) {
  const isComplete = !!championPick;

  const handleGenerate = () => {
    const regs = data.regions;

    const leftData = buildSide(data, regs[0].name, regs[2].name, regionPicks, firstFourPicks, semifinal1Pick);
    const rightData = buildSide(data, regs[1].name, regs[3].name, regionPicks, firstFourPicks, semifinal2Pick);

    const colX = getColX();
    const leftCols = [colX[0], colX[1], colX[2], colX[3], colX[4]];
    const rightCols = [colX[10], colX[9], colX[8], colX[7], colX[6]];
    const champCol = colX[5];

    const r64y = getR64Y();
    const r32y = nextRoundY(r64y);
    const s16y = nextRoundY(r32y);
    const e8y = nextRoundY(s16y);
    const semiy = nextRoundY(e8y);
    const allY = [r64y, r32y, s16y, e8y, semiy];

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Title
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("2026 NCAA MARCH MADNESS BRACKET", PW / 2, 6, { align: "center" });
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("My Picks — Printable Bracket", PW / 2, 9.5, { align: "center" });

    // Round labels
    const leftLabels = ["Round of 64", "Round of 32", "Round of 16", "Round of 8", "Nat. Semis"];
    const rightLabels = [...leftLabels].reverse();
    doc.setFontSize(3.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40);
    for (let i = 0; i < 5; i++) {
      doc.text(leftLabels[i], leftCols[i] + SW / 2, HEADER_H - 1.5, { align: "center" });
      doc.text(rightLabels[i], rightCols[4 - i] + SW / 2, HEADER_H - 1.5, { align: "center" });
    }
    doc.text("Championship", champCol + SW / 2, HEADER_H - 1.5, { align: "center" });
    doc.setDrawColor(180);
    doc.setLineWidth(0.1);
    doc.line(colX[0], HEADER_H - 0.5, colX[10] + SW, HEADER_H - 0.5);

    // Draw sides
    drawSide(doc, leftCols, [leftData.r64, leftData.r32, leftData.s16, leftData.e8, leftData.semi], allY, true);
    drawSide(doc, rightCols, [rightData.r64, rightData.r32, rightData.s16, rightData.e8, rightData.semi], allY, false);

    // Semi → Championship connectors
    const semiTopBottom = semiy[0] + SH;
    const semiBotBottom = semiy[1] + SH;
    const champGap = 6;
    const champMidY = (semiTopBottom + semiBotBottom) / 2;
    const champTopY = champMidY - SH - champGap;
    const champBotY = champMidY + champGap;
    const champTopBottom = champTopY + SH;
    const champBotBottom = champBotY + SH;

    // Left semi bracket
    const lsx = leftCols[4] + SW;
    const lbx = lsx + CG * 0.45;
    ln(doc, lsx, semiTopBottom, lbx, semiTopBottom);
    ln(doc, lsx, semiBotBottom, lbx, semiBotBottom);
    ln(doc, lbx, semiTopBottom, lbx, semiBotBottom);
    ln(doc, lbx, champTopBottom, champCol, champTopBottom);

    // Right semi bracket
    const rsx = rightCols[4];
    const rbx = rsx - CG * 0.45;
    ln(doc, rsx, semiTopBottom, rbx, semiTopBottom);
    ln(doc, rsx, semiBotBottom, rbx, semiBotBottom);
    ln(doc, rbx, semiTopBottom, rbx, semiBotBottom);
    ln(doc, rbx, champBotBottom, champCol + SW, champBotBottom);

    // Seeds
    const seeds = new Map<string, number>();
    for (const r of regs) {
      const region = data.regions.find(rg => rg.name === r.name)!;
      const resolved = region.matchups.map(m => {
        let bt = m.bottom_team;
        if (m.first_four_placeholder) {
          const ff = data.first_four.find(f => f.winner_plays_region === r.name && f.winner_plays_seed === m.bottom_seed);
          if (ff) bt = firstFourPicks[data.first_four.indexOf(ff)] || bt;
        }
        return { ts: m.top_seed, tt: m.top_team, bs: m.bottom_seed, bt };
      });
      for (const m of resolved) {
        seeds.set(m.tt, m.ts);
        seeds.set(m.bt, m.bs);
      }
    }
    const sl = (t: string | null) => t ? `${seeds.get(t) ?? "?"} ${t}` : "";

    // Championship slots
    if (semifinal1Pick) drawSlot(doc, champCol, champTopY, sl(semifinal1Pick), championPick === semifinal1Pick);
    else drawEmptySlot(doc, champCol, champTopY);
    if (semifinal2Pick) drawSlot(doc, champCol, champBotY, sl(semifinal2Pick), championPick === semifinal2Pick);
    else drawEmptySlot(doc, champCol, champBotY);

    // Champion box (centered between championship lines)
    if (championPick) {
      const boxH = 8;
      const spaceBetween = champBotBottom - champTopBottom;
      const boxY = champTopBottom + (spaceBetween - boxH) / 2;
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(champCol - 2, boxY, SW + 4, boxH, "S");
      doc.setFontSize(3.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("CHAMPION", champCol + SW / 2, boxY + 3, { align: "center" });
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(sl(championPick), champCol + SW / 2, boxY + 6, { align: "center" });
    }

    // Region labels
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200);
    const topCenterY = (r64y[0] + r64y[15] + SH) / 2;
    const botCenterY = (r64y[16] + r64y[31] + SH) / 2;
    const leftLabelX = (leftCols[1] + SW + leftCols[2]) / 2;
    const rightLabelX = (rightCols[1] + rightCols[2] + SW) / 2;
    doc.text(regs[0].name.toUpperCase(), leftLabelX, topCenterY, { align: "center" });
    doc.text(regs[2].name.toUpperCase(), leftLabelX, botCenterY, { align: "center" });
    doc.text(regs[1].name.toUpperCase(), rightLabelX, topCenterY, { align: "center" });
    doc.text(regs[3].name.toUpperCase(), rightLabelX, botCenterY, { align: "center" });

    // Footer
    doc.setTextColor(180);
    doc.setFontSize(3.5);
    doc.setFont("helvetica", "normal");
    doc.text("Made with 🏀 by Sunil Sadasivan for March Madness 2026", PW / 2, PH - 2, { align: "center" });

    doc.save("march-madness-bracket-2026.pdf");
  };

  return (
    <div className="text-center">
      <button
        onClick={handleGenerate}
        disabled={!isComplete}
        className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
          isComplete
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 animate-pulse-glow cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isComplete
          ? "📄 Generate Printable Bracket PDF"
          : "📄 Complete Your Bracket to Generate PDF"}
      </button>
    </div>
  );
}
