import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  name: string;
  feedAmperage?: number | null;
}

interface PanelBreadcrumbsProps {
  hierarchy: BreadcrumbItem[];
  onNavigate: (panelId: string) => void;
}

export function PanelBreadcrumbs({ hierarchy, onNavigate }: PanelBreadcrumbsProps) {
  if (hierarchy.length <= 1) {
    return null; // Don't show breadcrumbs for root panel
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 no-print">
      <Home size={16} className="text-gray-400" />
      {hierarchy.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} className="text-gray-400" />}
          <button
            onClick={() => onNavigate(item.id)}
            className={`hover:text-blue-600 transition-colors ${
              index === hierarchy.length - 1
                ? 'font-semibold text-gray-900'
                : 'text-gray-600'
            }`}
            disabled={index === hierarchy.length - 1}
          >
            {item.name}
            {item.feedAmperage && index > 0 && (
              <span className="text-xs text-gray-500 ml-1">
                ({item.feedAmperage}A feed)
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
