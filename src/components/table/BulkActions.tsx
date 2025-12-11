import { Button } from '@/components/ui/button';
import { Trash2, Download, CheckCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  customActions?: Array<{ label: string; icon?: any; onClick: () => void }>;
}

export function BulkActions({
  selectedCount,
  onDelete,
  onExport,
  onActivate,
  onDeactivate,
  customActions,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-accent border-b rounded-t-lg">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2 ml-auto">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
        {onActivate && (
          <Button variant="outline" size="sm" onClick={onActivate}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate
          </Button>
        )}
        {onDeactivate && (
          <Button variant="outline" size="sm" onClick={onDeactivate}>
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </Button>
        )}
        {customActions && customActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {customActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={index} onClick={action.onClick}>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}



