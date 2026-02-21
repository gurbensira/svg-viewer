import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode
} from 'react';
import type { Design } from '../types/design.types';
import { fetchDesigns } from '../services/api.service';

interface DesignsContextValue {
  designs: Design[];
  isLoading: boolean;
  error: string | null;
  loadDesigns: () => Promise<void>;
}

const DesignsContext = createContext<DesignsContextValue | null>(null);

export const DesignsProvider = ({ children }: { children: ReactNode }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDesigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchDesigns();
      setDesigns(fetched);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load designs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({ designs, isLoading, error, loadDesigns }),
    [designs, isLoading, error, loadDesigns]
  );

  return (
    <DesignsContext.Provider value={contextValue}>
      {children}
    </DesignsContext.Provider>
  );
};

export const useDesignsContext = (): DesignsContextValue => {
  const context = useContext(DesignsContext);
  if (!context) throw new Error('useDesignsContext must be used within DesignsProvider');
  return context;
};
