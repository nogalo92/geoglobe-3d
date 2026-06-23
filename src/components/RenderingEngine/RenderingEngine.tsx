import { Engine } from "react-babylonjs";
import "./RenderingEngine.scss";

import { useEffect, type ReactNode } from "react";

type RenderingEngineProps = {
  children?: ReactNode;
};

function RenderingEngine({ children }: RenderingEngineProps) {
  const isInspectorOn = import.meta.env.VITE_INSPECTOR === "on";

  useEffect(() => {
    if (isInspectorOn) {
      import("@babylonjs/inspector")
        .then(() => import("@babylonjs/core/Debug/debugLayer"))
        .catch((error) => {
          console.error("Failed to load Babylon.js Inspector modules: ", error);
        });
    }
  }, [isInspectorOn]);

  return (
    <div className="rendering-engine-wrapper disable-highlight">
      <Engine
        antialias
        adaptToDeviceRatio
        canvasId="babylonjs"
        engineOptions={{ stencil: true }}
      >
        {children}
      </Engine>
    </div>
  );
}

export default RenderingEngine;
