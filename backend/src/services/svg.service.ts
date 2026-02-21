import { promises as fs } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import type { Design, RectItem, DesignIssue, DesignStatus } from '../types/design.types';

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

const RECT_OUT_OF_BOUNDS_ISSUE = 'OUT_OF_BOUNDS' as const;
const DESIGN_ISSUE_EMPTY = 'EMPTY' as const;
const DESIGN_ISSUE_OUT_OF_BOUNDS = 'OUT_OF_BOUNDS' as const;

interface RawSvgAttributes {
  width?: string | number;
  height?: string | number;
}

interface RawRectAttributes {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  fill?: string;
}

interface ParsedSvgRoot {
  svg?: {
    width?: string | number;
    height?: string | number;
    rect?: RawRectAttributes | RawRectAttributes[];
  };
}

const toNumber = (value: string | number | undefined): number =>
  value === undefined ? 0 : Number(value);

const extractSvgDimensions = (svgAttributes: RawSvgAttributes): { svgWidth: number; svgHeight: number } => ({
  svgWidth: toNumber(svgAttributes.width),
  svgHeight: toNumber(svgAttributes.height)
});

const normalizeRects = (rawRect: RawRectAttributes | RawRectAttributes[] | undefined): RawRectAttributes[] => {
  if (!rawRect) return [];
  return Array.isArray(rawRect) ? rawRect : [rawRect];
};

const isRectOutOfBounds = (rect: RawRectAttributes, svgWidth: number, svgHeight: number): boolean => {
  const x = toNumber(rect.x);
  const y = toNumber(rect.y);
  const width = toNumber(rect.width);
  const height = toNumber(rect.height);
  return x + width > svgWidth || y + height > svgHeight;
};

const parseRectItem = (rect: RawRectAttributes, svgWidth: number, svgHeight: number): RectItem => ({
  x: toNumber(rect.x),
  y: toNumber(rect.y),
  width: toNumber(rect.width),
  height: toNumber(rect.height),
  fill: rect.fill ?? '#000000',
  issue: isRectOutOfBounds(rect, svgWidth, svgHeight) ? RECT_OUT_OF_BOUNDS_ISSUE : null
});

const calculateCoverageRatio = (items: RectItem[], svgWidth: number, svgHeight: number): number => {
  const canvasArea = svgWidth * svgHeight;
  if (canvasArea === 0) return 0;
  const totalRectArea = items.reduce((sum, rect) => sum + rect.width * rect.height, 0);
  return totalRectArea / canvasArea;
};

const determineDesignIssues = (items: RectItem[]): DesignIssue[] => {
  const issues: DesignIssue[] = [];
  if (items.length === 0) issues.push(DESIGN_ISSUE_EMPTY);
  if (items.some(item => item.issue === RECT_OUT_OF_BOUNDS_ISSUE)) issues.push(DESIGN_ISSUE_OUT_OF_BOUNDS);
  return issues;
};

const determineStatus = (issues: DesignIssue[]): DesignStatus => {
  if (issues.includes(DESIGN_ISSUE_EMPTY)) return 'empty';
  if (issues.includes(DESIGN_ISSUE_OUT_OF_BOUNDS)) return 'out_of_bounds';
  return 'valid';
};

export const parseSvgFile = async (filePath: string, filename: string): Promise<Omit<Design, 'createdAt'>> => {
  const svgContent = await fs.readFile(filePath, 'utf-8');
  const parsed = xmlParser.parse(svgContent) as ParsedSvgRoot;

  const svgRoot = parsed.svg;
  if (!svgRoot) throw new Error('Invalid SVG: missing <svg> root element');

  const { svgWidth, svgHeight } = extractSvgDimensions(svgRoot);
  const rawRects = normalizeRects(svgRoot.rect);
  const items = rawRects.map(rect => parseRectItem(rect, svgWidth, svgHeight));
  const coverageRatio = calculateCoverageRatio(items, svgWidth, svgHeight);
  const issues = determineDesignIssues(items);
  const status = determineStatus(issues);

  return {
    filename,
    filePath,
    status,
    svgWidth,
    svgHeight,
    itemsCount: items.length,
    coverageRatio,
    issues,
    items
  };
};
