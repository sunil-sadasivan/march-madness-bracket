import { BracketData } from "./types";
import BracketPicker from "./components/BracketPicker";
import TestBracket from "./components/TestBracket";
import mensBracketJson from "./data/bracket2026.json";
import wbbBracketJson from "./data/wbb2026.json";

const mensBracketData = mensBracketJson as BracketData;
const wbbBracketData = wbbBracketJson as BracketData;

function App() {
  const path = window.location.pathname.replace(/\/march-madness-bracket\/?/, "/").replace(/\/$/, "") || "/";

  if (path === "/test") {
    return <TestBracket data={mensBracketData} />;
  }

  if (path === "/wbb/test") {
    return <TestBracket data={wbbBracketData} />;
  }

  if (path === "/wbb") {
    return <BracketPicker data={wbbBracketData} title="NCAA Women's" />;
  }

  return <BracketPicker data={mensBracketData} title="NCAA Men's" />;
}

export default App;
