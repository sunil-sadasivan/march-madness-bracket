import { BracketData } from "./types";
import BracketPicker from "./components/BracketPicker";
import TestBracket from "./components/TestBracket";
import bracketJson from "./data/bracket2026.json";

const bracketData = bracketJson as BracketData;

function App() {
  const isTestRoute = window.location.pathname === "/test";

  if (isTestRoute) {
    return <TestBracket data={bracketData} />;
  }

  return <BracketPicker data={bracketData} />;
}

export default App;
