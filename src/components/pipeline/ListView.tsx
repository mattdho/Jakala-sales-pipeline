import React from 'react';
import type { Opportunity, Job } from '../../types';

interface ListViewProps {
  opportunities: Opportunity[];
  jobs: Job[];
  onEditOpportunity: (op: Opportunity) => void;
  onEditJob: (job: Job) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  opportunities,
  jobs,
  onEditOpportunity,
  onEditJob
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Opportunities</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Value</th>
              <th className="px-2 py-1 text-left">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {opportunities.map(op => (
              <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => onEditOpportunity(op)}>
                <td className="px-2 py-1">{op.name}</td>
                <td className="px-2 py-1">${'{'}op.value.toLocaleString(){'}'}</td>
                <td className="px-2 py-1">{op.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Jobs</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-left">Value</th>
              <th className="px-2 py-1 text-left">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => onEditJob(job)}>
                <td className="px-2 py-1">{job.name}</td>
                <td className="px-2 py-1">${'{'}job.value.toLocaleString(){'}'}</td>
                <td className="px-2 py-1">{job.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
