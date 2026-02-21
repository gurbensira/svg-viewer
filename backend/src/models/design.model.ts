import { Schema, model, Document } from 'mongoose';
import type { Design, RectItem } from '../types/design.types';

export interface DesignDocument extends Design, Document {}

const rectItemSchema = new Schema<RectItem>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    fill: { type: String, required: true },
    issue: { type: String, enum: ['OUT_OF_BOUNDS', null], default: null }
  },
  { _id: false }
);

const designSchema = new Schema<DesignDocument>(
  {
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ['valid', 'empty', 'out_of_bounds'],
      required: true
    },
    svgWidth: { type: Number, required: true },
    svgHeight: { type: Number, required: true },
    itemsCount: { type: Number, required: true },
    coverageRatio: { type: Number, required: true },
    issues: [{ type: String, enum: ['OUT_OF_BOUNDS', 'EMPTY'] }],
    items: [rectItemSchema]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const DesignModel = model<DesignDocument>('Design', designSchema);
