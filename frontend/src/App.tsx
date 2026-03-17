import { useEffect } from "react";
import { BracketData } from "./types";
import BracketPicker from "./components/BracketPicker";
import TestBracket from "./components/TestBracket";
import mensBracketJson from "./data/bracket2026.json";
import wbbBracketJson from "./data/wbb2026.json";

const mensBracketData = mensBracketJson as BracketData;
const wbbBracketData = wbbBracketJson as BracketData;

function App() {
  const path = window.location.pathname.replace(/\/march-madness-bracket\/?/, "/").replace(/\/$/, "") || "/";
  const isWbb = path.startsWith("/wbb");

  useEffect(() => {
    document.title = isWbb
      ? "NCAA Women's March Madness Bracket Picker 2026 🏀"
      : "NCAA Men's March Madness Bracket Picker 2026 🏀";
  }, [isWbb]);

  if (path === "/test") {
    return <TestBracket data={mensBracketData} />;
  }

  if (path === "/wbb/test") {
    return <TestBracket data={wbbBracketData} />;
  }

  if (path === "/wbb") {
    return <BracketPicker data={wbbBracketData} title="NCAA Women's" isWbb={true} />;
  }

  return <BracketPicker data={mensBracketData} title="NCAA Men's" isWbb={false} />;
}

export default App;
