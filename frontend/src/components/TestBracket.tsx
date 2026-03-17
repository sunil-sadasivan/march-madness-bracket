import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { BracketData } from "../types";
import { RegionPicks } from "./RegionBracket";

// ===== LAYOUT CONSTANTS =====
const PW = 297, PH = 210;
const SW = 24, SH = 4.2;
const CG = 2.8;           // column gap
const RG = 5;              // gap between top/bottom region
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
  doc.setFontSize(4);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setTextColor(0);
  const maxChars = Math.floor(SW / 1.45);
  const text = label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label;
  doc.text(text, x + 0.5, bottomY - 0.8);
}

function drawEmptySlot(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(160);
  doc.setLineWidth(0.1);
  doc.line(x, y + SH, x + SW, y + SH);
}

// Draw bracket connector from a pair of slots to a known target point
// targetY is the exact Y of the next-round slot's bottom line
function drawConnector(
  doc: jsPDF,
  slotX: number, topSlotY: number, botSlotY: number,
  nextSlotX: number, targetY: number,
  flowRight: boolean
) {
  const topLine = topSlotY + SH;  // bottom line of top slot
  const botLine = botSlotY + SH;  // bottom line of bottom slot

  if (flowRight) {
    const rightEdge = slotX + SW;
    const bx = rightEdge + CG * 0.45;
    // Horizontal from both slot bottom-lines to bracket vertical
    ln(doc, rightEdge, topLine, bx, topLine);
    ln(doc, rightEdge, botLine, bx, botLine);
    // Vertical joining the two
    ln(doc, bx, topLine, bx, botLine);
    // Horizontal from bracket to next slot's bottom line
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

// ===== COLUMN POSITIONS (11 columns, symmetric) =====
function getColX(): number[] {
  const unit = SW + CG;
  const cx = PW / 2 - SW / 2;
  const c: number[] = new Array(11);
  for (let i = 0; i <= 4; i++) c[i] = cx - (5 - i) * unit;
  c[5] = cx;
  for (let i = 6; i <= 10; i++) c[i] = cx + (i - 5) * unit;
  return c;
}

// ===== Y POSITIONS =====
// 32 R64 slots evenly distributed (16 top + gap + 16 bottom)
function getR64Y(): number[] {
  const availH = PH - HEADER_H - BOTTOM_M - RG;
  const step = availH / 32;
  const y: number[] = [];
  for (let i = 0; i < 16; i++) y.push(HEADER_H + i * step);
  for (let i = 0; i < 16; i++) y.push(HEADER_H + 16 * step + RG + i * step);
  return y;
}

// Next round: each slot's bottom line sits at the midpoint of the
// two feeding slots' bottom lines.
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

// ===== RANDOM FILL =====
function randomFill(data: BracketData) {
  const coin = () => Math.random() < 0.5;
  const ffp: Record<number, string> = {};
  data.first_four.forEach((g, i) => { ffp[i] = coin() ? g.team_a : g.team_b; });

  const res: Record<string, Array<{ ts: number; tt: string; bs: number; bt: string }>> = {};
  data.regions.forEach(r => {
    res[r.name] = r.matchups.map(m => {
      let bt = m.bottom_team;
      if (m.first_four_placeholder) {
        const ff = data.first_four.find(f => f.winner_plays_region === r.name && f.winner_plays_seed === m.bottom_seed);
        if (ff) bt = ffp[data.first_four.indexOf(ff)] || bt;
      }
      return { ts: m.top_seed, tt: m.top_team, bs: m.bottom_seed, bt };
    });
  });

  const rp: Record<string, RegionPicks> = {};
  data.regions.forEach(r => {
    const ms = res[r.name];
    const p: RegionPicks = { r64: [], r32: [], sweet16: [], elite8: null };
    for (let i = 0; i < 8; i++) p.r64.push(coin() ? ms[i].tt : ms[i].bt);
    for (let i = 0; i < 4; i++) p.r32.push(coin() ? p.r64[i * 2]! : p.r64[i * 2 + 1]!);
    for (let i = 0; i < 2; i++) p.sweet16.push(coin() ? p.r32[i * 2]! : p.r32[i * 2 + 1]!);
    p.elite8 = coin() ? p.sweet16[0]! : p.sweet16[1]!;
    rp[r.name] = p;
  });

  const rr = data.regions;
  const s1 = coin() ? rp[rr[0].name].elite8! : rp[rr[2].name].elite8!;
  const s2 = coin() ? rp[rr[1].name].elite8! : rp[rr[3].name].elite8!;
  const ch = coin() ? s1 : s2;
  return { ffp, rp, res, s1, s2, ch };
}

// ===== SLOT DATA =====
interface Slot { label: string; bold: boolean; }

function buildSide(
  topReg: string, botReg: string,
  rp: Record<string, RegionPicks>,
  res: Record<string, Array<{ ts: number; tt: string; bs: number; bt: string }>>,
  semiWinner: string | null
) {
  const seeds = new Map<string, number>();
  for (const rn of [topReg, botReg]) {
    for (const m of res[rn]) {
      seeds.set(m.tt, m.ts);
      seeds.set(m.bt, m.bs);
    }
  }
  const sl = (t: string | null) => t ? `${seeds.get(t) ?? "?"} ${t}` : "";

  const buildReg = (rn: string) => {
    const ms = res[rn]; const p = rp[rn];
    const r64: Slot[] = [];
    for (let i = 0; i < 8; i++) {
      r64.push({ label: sl(ms[i].tt), bold: p.r64[i] === ms[i].tt });
      r64.push({ label: sl(ms[i].bt), bold: p.r64[i] === ms[i].bt });
    }
    const r32: Slot[] = [];
    for (let i = 0; i < 8; i++) {
      const t = p.r64[i];
      r32.push({ label: sl(t), bold: p.r32[Math.floor(i / 2)] === t });
    }
    const s16: Slot[] = [];
    for (let i = 0; i < 4; i++) {
      const t = p.r32[i];
      s16.push({ label: sl(t), bold: p.sweet16[Math.floor(i / 2)] === t });
    }
    const e8: Slot[] = [];
    for (let i = 0; i < 2; i++) {
      const t = p.sweet16[i];
      e8.push({ label: sl(t), bold: p.elite8 === t });
    }
    return { r64, r32, s16, e8, elite8: p.elite8 };
  };

  const top = buildReg(topReg);
  const bot = buildReg(botReg);

  return {
    r64: [...top.r64, ...bot.r64],
    r32: [...top.r32, ...bot.r32],
    s16: [...top.s16, ...bot.s16],
    e8: [...top.e8, ...bot.e8],
    semi: [
      { label: sl(top.elite8), bold: semiWinner === top.elite8 } as Slot,
      { label: sl(bot.elite8), bold: semiWinner === bot.elite8 } as Slot,
    ],
  };
}

// ===== DRAW ONE SIDE =====
// Draws all slots and bracket connectors for one side (left or right)
function drawSide(
  doc: jsPDF,
  cols: number[],           // 5 column x positions [R64, R32, S16, E8, Semi]
  slots: Slot[][],          // [r64(32), r32(16), s16(8), e8(4), semi(2)]
  ys: number[][],           // y positions per round
  flowRight: boolean,
) {
  // 1. Draw all slots
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

  // 2. Draw bracket connectors between rounds
  // Each pair in round R connects to a single slot in round R+1
  for (let round = 0; round < 4; round++) {
    const cx = cols[round];
    const nextCx = cols[round + 1];
    const roundYs = ys[round];
    const nextYs = ys[round + 1];

    for (let j = 0; j < roundYs.length; j += 2) {
      const nextIdx = j / 2;
      // Target: the bottom line of the next-round slot
      const targetY = nextYs[nextIdx] + SH;
      drawConnector(doc, cx, roundYs[j], roundYs[j + 1], nextCx, targetY, flowRight);
    }
  }
}

// ===== MAIN COMPONENT =====
interface TestBracketProps { data: BracketData; }

export default function TestBracket({ data }: TestBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const generated = useRef(false);

  useEffect(() => {
    if (generated.current) return;
    generated.current = true;

    const { ffp, rp, res, s1, s2, ch } = randomFill(data);
    const regs = data.regions;

    const leftData = buildSide(regs[0].name, regs[2].name, rp, res, s1);
    const rightData = buildSide(regs[1].name, regs[3].name, rp, res, s2);

    // Column positions
    const colX = getColX();
    const leftCols = [colX[0], colX[1], colX[2], colX[3], colX[4]];
    const rightCols = [colX[10], colX[9], colX[8], colX[7], colX[6]];
    const champCol = colX[5];

    // Y positions
    const r64y = getR64Y();
    const r32y = nextRoundY(r64y);
    const s16y = nextRoundY(r32y);
    const e8y = nextRoundY(s16y);
    const semiy = nextRoundY(e8y);
    const allY = [r64y, r32y, s16y, e8y, semiy];

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // ---- TITLE ----
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("2026 NCAA MARCH MADNESS BRACKET", PW / 2, 6, { align: "center" });
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("My Picks — Printable Bracket", PW / 2, 9.5, { align: "center" });

    // ---- ROUND LABELS ----
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

    // ---- DRAW BOTH SIDES ----
    drawSide(doc, leftCols, [leftData.r64, leftData.r32, leftData.s16, leftData.e8, leftData.semi], allY, true);
    drawSide(doc, rightCols, [rightData.r64, rightData.r32, rightData.s16, rightData.e8, rightData.semi], allY, false);

    // ---- SEMI → CHAMPIONSHIP ----
    // Semi slot bottom lines
    const semiTopBottom = semiy[0] + SH;
    const semiBotBottom = semiy[1] + SH;

    // Championship slots: position so they're centered between the semi slots
    const champGap = 6;
    const champMidY = (semiTopBottom + semiBotBottom) / 2;
    const champTopY = champMidY - SH - champGap;
    const champBotY = champMidY + champGap;
    const champTopBottom = champTopY + SH;
    const champBotBottom = champBotY + SH;

    // Left semi bracket → championship left slot
    const lsx = leftCols[4] + SW;
    const lbx = lsx + CG * 0.45;
    ln(doc, lsx, semiTopBottom, lbx, semiTopBottom);
    ln(doc, lsx, semiBotBottom, lbx, semiBotBottom);
    ln(doc, lbx, semiTopBottom, lbx, semiBotBottom);
    // Horizontal to championship top slot's bottom line
    ln(doc, lbx, champTopBottom, champCol, champTopBottom);

    // Right semi bracket → championship bottom slot
    const rsx = rightCols[4];
    const rbx = rsx - CG * 0.45;
    ln(doc, rsx, semiTopBottom, rbx, semiTopBottom);
    ln(doc, rsx, semiBotBottom, rbx, semiBotBottom);
    ln(doc, rbx, semiTopBottom, rbx, semiBotBottom);
    // Horizontal to championship bottom slot's bottom line
    ln(doc, rbx, champBotBottom, champCol + SW, champBotBottom);

    // Seeds lookup
    const seeds = new Map<string, number>();
    for (const r of regs) {
      for (const m of res[r.name]) {
        seeds.set(m.tt, m.ts);
        seeds.set(m.bt, m.bs);
      }
    }
    const sl = (t: string | null) => t ? `${seeds.get(t) ?? "?"} ${t}` : "";

    // Championship slots
    drawSlot(doc, champCol, champTopY, sl(s1), ch === s1);
    drawSlot(doc, champCol, champBotY, sl(s2), ch === s2);

    // Champion box — centered BETWEEN the two championship slot lines
    if (ch) {
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
      doc.setFontSize(4.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(sl(ch), champCol + SW / 2, boxY + 6, { align: "center" });
    }

    // ---- REGION LABELS (watermark style) ----
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

    // ---- FOOTER ----
    doc.setTextColor(180);
    doc.setFontSize(3.5);
    doc.setFont("helvetica", "normal");
    doc.text("Generated with March Madness Bracket Picker 2026", PW / 2, PH - 2, { align: "center" });

    // ---- RENDER ----
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    if (containerRef.current) {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.style.width = "100%";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      containerRef.current.appendChild(iframe);
    }
  }, [data]);

  return (
    <div>
      <div style={{
        background: "#222", color: "white", padding: "10px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: "system-ui"
      }}>
        <div>
          <strong>🏀 Test Bracket Preview</strong>
          <span style={{ marginLeft: 12, opacity: 0.6, fontSize: 14 }}>Random picks — refresh for new</span>
        </div>
        <a href="/" style={{ color: "#ffd700", textDecoration: "none", fontWeight: "bold" }}>← Back to Picker</a>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
