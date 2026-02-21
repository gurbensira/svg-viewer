import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDesignById } from '../services/api.service';
import CanvasPreview from './CanvasPreview';
import type { Design, DesignStatus, DesignIssue } from '../types/design.types';

const STATUS_STYLES: Record<DesignStatus, string> = {
  valid: 'bg-green-100 text-green-700',
  empty: 'bg-gray-100 text-gray-600',
  out_of_bounds: 'bg-red-100 text-red-700'
};

const STATUS_LABELS: Record<DesignStatus, string> = {
  valid: 'Valid',
  empty: 'Empty',
  out_of_bounds: 'Out of bounds'
};

const ISSUE_LABELS: Record<DesignIssue, string> = {
  EMPTY: 'No rectangles found',
  OUT_OF_BOUNDS: 'One or more rectangles exceed the SVG boundary'
};

const formatCoverage = (ratio: number): string =>
  `${(ratio * 100).toFixed(2)}%`;

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleString();

const MetaRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm text-gray-700 font-medium">{value}</span>
  </div>
);

const DesignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [design, setDesign] = useState<Design | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadDesign = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetched = await fetchDesignById(id);
        setDesign(fetched);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load design');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDesign();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/designs')}
          className="mb-6 text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
        >
          ← Back to designs
        </button>

        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {design && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800 truncate max-w-sm">
                  {design.filename}
                </h1>
                <span className={`ml-4 inline-block px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 ${STATUS_STYLES[design.status]}`}>
                  {STATUS_LABELS[design.status]}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                <MetaRow label="SVG dimensions" value={`${design.svgWidth} × ${design.svgHeight}px`} />
                <MetaRow label="Rectangles" value={design.itemsCount} />
                <MetaRow label="Coverage ratio" value={formatCoverage(design.coverageRatio)} />
                <MetaRow label="Uploaded" value={formatDate(design.createdAt)} />
                {design.issues.length > 0 && (
                  <MetaRow
                    label="Issues"
                    value={
                      <ul className="text-right space-y-0.5">
                        {design.issues.map(issue => (
                          <li key={issue} className="text-red-600 font-medium text-xs">
                            {ISSUE_LABELS[issue]}
                          </li>
                        ))}
                      </ul>
                    }
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Canvas Preview</h2>
              <CanvasPreview design={design} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignDetail;
