import { DesignModel, type DesignDocument } from '../models/design.model';
import { parseSvgFile } from './svg.service';

export const createDesignFromUpload = async (
  filePath: string,
  filename: string
): Promise<DesignDocument> => {
  const parsedDesign = await parseSvgFile(filePath, filename);
  const design = new DesignModel(parsedDesign);
  return design.save();
};

export const getAllDesigns = async (): Promise<DesignDocument[]> =>
  DesignModel.find().sort({ createdAt: -1 });

export const getDesignById = async (id: string): Promise<DesignDocument | null> =>
  DesignModel.findById(id);
