export interface StrokePoint {
  x: number;
  y: number;
  width: number;
  timestamp: number;
}

export interface CompletedStroke {
  points: StrokePoint[];
  color: string;
}

interface StrokeEngineConfig {
  minWidth: number;
  maxWidth: number;
  baseWidth: number;
  sensitivity: number;
  smoothingFactor: number;
}

const DEFAULT_CONFIG: StrokeEngineConfig = {
  minWidth: 1.2,
  maxWidth: 5,
  baseWidth: 3.5,
  sensitivity: 0.005,
  smoothingFactor: 0.3,
};

export interface StrokeEngine {
  addPoint: (x: number, y: number, timestamp: number) => StrokePoint;
  getPoints: () => StrokePoint[];
  reset: () => void;
  commitStroke: (color: string) => void;
  getHistory: () => CompletedStroke[];
  clearHistory: () => void;
}

export function createStrokeEngine(
  config: Partial<StrokeEngineConfig> = {}
): StrokeEngine {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  let currentPoints: StrokePoint[] = [];
  let smoothedWidth = cfg.baseWidth;
  const history: CompletedStroke[] = [];

  function velocityToWidth(velocity: number): number {
    // TODO: Implement your velocity-to-width mapping here.
    // velocity is in pixels/ms. Typical range: 0 (still) to ~2 (fast flick).
    //
    // Consider:
    //   - Inverse relationship: faster movement = thinner line
    //   - cfg.minWidth (1.2), cfg.maxWidth (5), cfg.baseWidth (3.5)
    //   - cfg.sensitivity controls how reactive the width is to speed changes
    //
    // Current implementation: inverse mapping with sensitivity scaling
    const raw = cfg.baseWidth / (1 + velocity * cfg.sensitivity);
    return Math.max(cfg.minWidth, Math.min(cfg.maxWidth, raw));
  }

  function addPoint(x: number, y: number, timestamp: number): StrokePoint {
    let width = cfg.baseWidth;

    if (currentPoints.length > 0) {
      const prev = currentPoints[currentPoints.length - 1]!;
      const dx = x - prev.x;
      const dy = y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = Math.max(1, timestamp - prev.timestamp);
      const velocity = distance / dt;

      const targetWidth = velocityToWidth(velocity);
      smoothedWidth =
        smoothedWidth * (1 - cfg.smoothingFactor) +
        targetWidth * cfg.smoothingFactor;
      width = smoothedWidth;
    } else {
      smoothedWidth = cfg.baseWidth;
    }

    const point: StrokePoint = { x, y, width, timestamp };
    currentPoints.push(point);
    return point;
  }

  function getPoints(): StrokePoint[] {
    return currentPoints;
  }

  function reset(): void {
    currentPoints = [];
    smoothedWidth = cfg.baseWidth;
  }

  function commitStroke(color: string): void {
    if (currentPoints.length > 1) {
      history.push({ points: [...currentPoints], color });
    }
    reset();
  }

  function getHistory(): CompletedStroke[] {
    return history;
  }

  function clearHistory(): void {
    history.length = 0;
  }

  return { addPoint, getPoints, reset, commitStroke, getHistory, clearHistory };
}
