// blueprintUtils.js - Blueprint rendering utilities
import { BLUEPRINT_GRID, BLUEPRINT_PAPER } from './constants.js';

export const createBlueprintGrid = (width, height) => {
  const gridSize = 20;
  const gridLines = [];
  
  for (let x = 0; x <= width; x += gridSize) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={BLUEPRINT_GRID}
        strokeWidth="0.5"
        strokeOpacity="0.1"
      />
    );
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={BLUEPRINT_GRID}
        strokeWidth="0.5"
        strokeOpacity="0.1"
      />
    );
  }
  
  for (let x = 0; x <= width; x += 100) {
    gridLines.push(
      <line
        key={`guide-v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={BLUEPRINT_GRID}
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeDasharray="5,5"
      />
    );
  }
  
  for (let y = 0; y <= height; y += 100) {
    gridLines.push(
      <line
        key={`guide-h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={BLUEPRINT_GRID}
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeDasharray="5,5"
      />
    );
  }
  
  return gridLines;
};

export const createBlueprintPaper = () => {
  return (
    <defs>
      <pattern
        id="blueprint-pattern"
        width="200"
        height="200"
        patternUnits="userSpaceOnUse"
      >
        <rect width="200" height="200" fill={BLUEPRINT_PAPER} />
        <line
          x1="0"
          y1="200"
          x2="200"
          y2="0"
          stroke="#E0F2FE"
          strokeWidth="0.3"
          strokeOpacity="0.2"
        />
        <line
          x1="0"
          y1="0"
          x2="200"
          y2="200"
          stroke="#E0F2FE"
          strokeWidth="0.3"
          strokeOpacity="0.2"
        />
      </pattern>
    </defs>
  );
};