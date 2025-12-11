import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, FileCheck, DollarSign, Award, UserPlus, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'enrollment' | 'payment' | 'assessment' | 'certificate' | 'application' | 'session';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  maxItems?: number;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'enrollment',
    title: 'New Enrollment',
    description: 'John Doe enrolled in Network Security Cohort',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    user: 'Admin',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment of $500 received from Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: 'System',
  },
  {
    id: '3',
    type: 'assessment',
    title: 'Grade Submitted',
    description: 'Assignment 1 graded for 15 students',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    user: 'Dr. Smith',
  },
  {
    id: '4',
    type: 'certificate',
    title: 'Certificate Issued',
    description: 'Certificate issued to Alice Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: 'Admin',
  },
  {
    id: '5',
    type: 'application',
    title: 'Application Submitted',
    description: 'New application received from Bob Williams',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    user: 'System',
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'enrollment':
      return <Users className="h-4 w-4" />;
    case 'payment':
      return <DollarSign className="h-4 w-4" />;
    case 'assessment':
      return <FileCheck className="h-4 w-4" />;
    case 'certificate':
      return <Award className="h-4 w-4" />;
    case 'application':
      return <UserPlus className="h-4 w-4" />;
    case 'session':
      return <Calendar className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'enrollment':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
    case 'payment':
      return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
    case 'assessment':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
    case 'certificate':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300';
    case 'application':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300';
    case 'session':
      return 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function ActivityTimeline({ activities = mockActivities, maxItems = 10 }: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      getActivityColor(activity.type)
                    )}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < displayedActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                    {activity.user && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

