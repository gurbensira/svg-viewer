import { useEffect } from 'react';
import { useDesignsContext } from '../context/DesignsContext';
import type { Design } from '../types/design.types';

interface UseDesignsResult {
  designs: Design[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const useDesigns = (): UseDesignsResult => {
  const { designs, isLoading, error, loadDesigns } = useDesignsContext();

  useEffect(() => {
    void loadDesigns();
  }, [loadDesigns]);

  return { designs, isLoading, error, refresh: loadDesigns };
};

export default useDesigns;
