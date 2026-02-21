export type DesignStatus = 'valid' | 'empty' | 'out_of_bounds';
export type RectIssue = 'OUT_OF_BOUNDS' | null;
export type DesignIssue = 'OUT_OF_BOUNDS' | 'EMPTY';

export interface RectItem {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  issue: RectIssue;
}

export interface Design {
  filename: string;
  filePath: string;
  status: DesignStatus;
  createdAt: Date;
  svgWidth: number;
  svgHeight: number;
  itemsCount: number;
  coverageRatio: number;
  issues: DesignIssue[];
  items: RectItem[];
}
