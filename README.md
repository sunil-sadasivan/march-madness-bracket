# 🏀 March Madness Bracket Picker 2026

Interactive NCAA March Madness bracket picker that generates a printable PDF.

**Live:** [sunil-sadasivan.github.io/march-madness-bracket](https://sunil-sadasivan.github.io/march-madness-bracket/)

## Features

- 🎯 Click-to-advance bracket picker (First Four → Championship)
- 📄 Generates clean, printable B&W landscape PDF
- 🎨 Region colors and emoji-based kid-friendly design
- 🎉 Confetti celebrations on picks
- 📱 Fully client-side — no backend required

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **PDF:** jspdf (client-side generation)
- **Hosting:** GitHub Pages (static site)

## Development

```bash
cd frontend
npm install
npm run dev
```

## Test Route

Visit `/test` for a randomly-filled bracket with inline PDF preview — great for testing the PDF layout.

## Build & Deploy

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions.

```bash
cd frontend
npm run build
```

## 2026 Bracket

All 68 teams across 4 regions:
- **East** (#1 Duke)
- **West** (#1 Arizona)
- **South** (#1 Florida)
- **Midwest** (#1 Michigan)

## License

MIT
