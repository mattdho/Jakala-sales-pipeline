import React from 'react';
import type { Opportunity, Job } from '../../types';

interface TimelineViewProps {
  opportunities: Opportunity[];
  jobs: Job[];
  onEditOpportunity: (op: Opportunity) => void;
  onEditJob: (job: Job) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  opportunities,
  jobs,
  onEditOpportunity,
  onEditJob
}) => {
  const events = [
    ...opportunities.map(op => ({
      id: op.id,
      date: op.expected_confirmation_date,
      type: 'opportunity' as const,
      data: op
    })),
    ...jobs.map(job => ({
      id: job.id,
      date: job.expected_confirmation_date,
      type: 'job' as const,
      data: job
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4">
      {events.map(evt => (
        <div
          key={evt.type + evt.id}
          className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
          onClick={() => evt.type === 'opportunity' ? onEditOpportunity(evt.data as Opportunity) : onEditJob(evt.data as Job)}
        >
          <div className="text-sm text-gray-500 mb-1">
            {new Date(evt.date).toLocaleDateString()}
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {evt.type === 'opportunity' ? (evt.data as Opportunity).name : (evt.data as Job).name}
          </div>
        </div>
      ))}
    </div>
  );
};
