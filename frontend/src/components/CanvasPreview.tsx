import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { Design, RectItem } from '../types/design.types';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const PADDING = 15;

const CANVAS_BG_COLOR = '#F3F4F6';
const STROKE_OUT_OF_BOUNDS = '#FF0000';
const STROKE_HOVERED = '#4F46E5';
const STROKE_DEFAULT = '#374151';
const LINE_WIDTH_HIGHLIGHTED = 2.5;
const LINE_WIDTH_DEFAULT = 1;

interface CanvasPreviewProps {
  design: Design;
}

const calculateScale = (svgWidth: number, svgHeight: number): number => {
  const scaleX = (CANVAS_WIDTH - PADDING * 2) / svgWidth;
  const scaleY = (CANVAS_HEIGHT - PADDING * 2) / svgHeight;
  return Math.min(scaleX, scaleY);
};

const getMousePositionOnCanvas = (
  canvas: HTMLCanvasElement,
  event: React.MouseEvent
): { x: number; y: number } => {
  const bounds = canvas.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
};

const findRectIndexAtPosition = (
  mouseX: number,
  mouseY: number,
  items: RectItem[],
  scale: number
): number => {
  for (let i = items.length - 1; i >= 0; i--) {
    const rect = items[i];
    const scaledX = PADDING + rect.x * scale;
    const scaledY = PADDING + rect.y * scale;
    const scaledW = rect.width * scale;
    const scaledH = rect.height * scale;
    if (mouseX >= scaledX && mouseX <= scaledX + scaledW && mouseY >= scaledY && mouseY <= scaledY + scaledH) {
      return i;
    }
  }
  return -1;
};

const drawBackground = (ctx: CanvasRenderingContext2D, svgWidth: number, svgHeight: number, scale: number) => {
  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(PADDING, PADDING, svgWidth * scale, svgHeight * scale);
};

const drawRect = (
  ctx: CanvasRenderingContext2D,
  rect: RectItem,
  scale: number,
  isHovered: boolean
) => {
  const x = PADDING + rect.x * scale;
  const y = PADDING + rect.y * scale;
  const w = rect.width * scale;
  const h = rect.height * scale;

  ctx.fillStyle = rect.fill;
  ctx.fillRect(x, y, w, h);

  if (rect.issue === 'OUT_OF_BOUNDS') {
    ctx.strokeStyle = STROKE_OUT_OF_BOUNDS;
    ctx.lineWidth = LINE_WIDTH_HIGHLIGHTED;
  } else if (isHovered) {
    ctx.strokeStyle = STROKE_HOVERED;
    ctx.lineWidth = LINE_WIDTH_HIGHLIGHTED;
  } else {
    ctx.strokeStyle = STROKE_DEFAULT;
    ctx.lineWidth = LINE_WIDTH_DEFAULT;
  }

  ctx.strokeRect(x, y, w, h);
};

const drawCanvas = (
  ctx: CanvasRenderingContext2D,
  design: Design,
  scale: number,
  hoveredIndex: number
) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground(ctx, design.svgWidth, design.svgHeight, scale);
  design.items.forEach((rect, index) => drawRect(ctx, rect, scale, index === hoveredIndex));
};

const CanvasPreview = ({ design }: CanvasPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [selectedRect, setSelectedRect] = useState<RectItem | null>(null);

  const scale = useMemo(
    () => calculateScale(design.svgWidth, design.svgHeight),
    [design.svgWidth, design.svgHeight]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, design, scale, hoveredIndex);
  }, [design, scale, hoveredIndex]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getMousePositionOnCanvas(canvas, event);
    const index = findRectIndexAtPosition(x, y, design.items, scale);
    setHoveredIndex(index);
  }, [design.items, scale]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(-1);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getMousePositionOnCanvas(canvas, event);
    const index = findRectIndexAtPosition(x, y, design.items, scale);
    setSelectedRect(index >= 0 ? design.items[index] : null);
  }, [design.items, scale]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="rounded-lg border border-gray-200 cursor-crosshair block"
        style={{ maxWidth: '100%' }}
      />

      {hoveredIndex >= 0 && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Hovering rect #{hoveredIndex + 1} — click to inspect
        </p>
      )}

      {selectedRect && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Selected Rectangle</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-gray-600">
            <span className="text-gray-400">x</span><span>{selectedRect.x}</span>
            <span className="text-gray-400">y</span><span>{selectedRect.y}</span>
            <span className="text-gray-400">width</span><span>{selectedRect.width}</span>
            <span className="text-gray-400">height</span><span>{selectedRect.height}</span>
            <span className="text-gray-400">fill</span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: selectedRect.fill }}
              />
              {selectedRect.fill}
            </span>
            <span className="text-gray-400">issue</span>
            <span className={selectedRect.issue ? 'text-red-600 font-medium' : 'text-gray-400'}>
              {selectedRect.issue ?? 'none'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasPreview;
