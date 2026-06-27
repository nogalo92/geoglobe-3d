import "./App.css";
import EarthScene from "@scenes/EarthScene/EarthScene";
import GameUI from "@gameUI/GameUI";
import RenderingEngine from "@renderingEngine/RenderingEngine";

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
