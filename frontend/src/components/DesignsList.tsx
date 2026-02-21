import { useNavigate } from 'react-router-dom';
import useDesigns from '../hooks/useDesigns';
import type { Design, DesignStatus } from '../types/design.types';

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

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleString();

const StatusBadge = ({ status }: { status: DesignStatus }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);

const DesignRow = ({ design, onClick }: { design: Design; onClick: () => void }) => (
  <tr
    onClick={onClick}
    className="border-t border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors"
  >
    <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">
      {design.filename}
    </td>
    <td className="px-4 py-3">
      <StatusBadge status={design.status} />
    </td>
    <td className="px-4 py-3 text-sm text-gray-600 text-center">
      {design.itemsCount}
    </td>
    <td className="px-4 py-3 text-sm text-gray-500">
      {formatDate(design.createdAt)}
    </td>
  </tr>
);

const DesignsList = () => {
  const { designs, isLoading, error, refresh } = useDesigns();
  const navigate = useNavigate();

  const handleRowClick = (id: string) => () => navigate(`/designs/${id}`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Designs</h1>
            <p className="text-sm text-gray-500 mt-0.5">{designs.length} file{designs.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => void refresh()}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600
                hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium
                hover:bg-indigo-700 transition-colors"
            >
              + Upload
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">Loading designs…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && designs.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No designs yet.{' '}
            <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">
              Upload one now.
            </button>
          </div>
        )}

        {!isLoading && designs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Filename</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody>
                {designs.map(design => (
                  <DesignRow
                    key={design._id}
                    design={design}
                    onClick={handleRowClick(design._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignsList;
