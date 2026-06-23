import GlobeScene from "@scenes/GlobeScene/GlobeScene";
import "./App.css";
import RenderingEngine from "@components/RenderingEngine/RenderingEngine";

function App() {
  return (
    <RenderingEngine>
      <GlobeScene />
    </RenderingEngine>
  );
}

export default App;
