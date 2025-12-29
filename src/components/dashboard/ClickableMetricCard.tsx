import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ClickableMetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function ClickableMetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  onClick,
  href,
  className,
}: ClickableMetricCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="relative">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <ArrowRight className="h-3 w-3 text-muted-foreground absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn('text-xs flex items-center gap-1 mt-1', trendColor)}>
            <span>{change}</span> from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}




