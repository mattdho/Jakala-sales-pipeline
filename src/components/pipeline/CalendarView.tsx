import React from 'react';
import type { Opportunity, Job } from '../../types';

interface CalendarViewProps {
  opportunities: Opportunity[];
  jobs: Job[];
  onEditOpportunity: (op: Opportunity) => void;
  onEditJob: (job: Job) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
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
      name: op.name
    })),
    ...jobs.map(job => ({
      id: job.id,
      date: job.expected_confirmation_date,
      type: 'job' as const,
      name: job.name
    }))
  ];

  const grouped = events.reduce<Record<string, typeof events>>( (acc, evt) => {
    const day = new Date(evt.date).toDateString();
    acc[day] = acc[day] || [];
    acc[day].push(evt);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {day}
          </h3>
          <div className="space-y-2">
            {dayEvents.map(ev => (
              <div
                key={ev.type + ev.id}
                className="p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
                onClick={() => ev.type === 'opportunity' ? onEditOpportunity(opportunities.find(o => o.id === ev.id)! ) : onEditJob(jobs.find(j => j.id === ev.id)!)}
              >
                {ev.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
