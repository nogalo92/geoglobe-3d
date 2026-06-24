import EarthScene from "@scenes/EarthScene/EarthScene";
import "./App.css";
import RenderingEngine from "./RenderingEngine/RenderingEngine";
import GameUI from "./GameUI/GameUI";

function App() {
  return (
    <>
      <RenderingEngine>
        <EarthScene />
      </RenderingEngine>

      <GameUI />
    </>
  );
}

export default App;
