import React from 'react';
import { useStore } from '../../store/useStore';
import type { Opportunity, Job } from '../../types';
import { KanbanView } from './KanbanView';
import { TimelineView } from './TimelineView';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';

export interface PipelineViewProps {
  opportunities: Opportunity[];
  jobs: Job[];
  onCreateOpportunity: () => void;
  onCreateJob: () => void;
  onEditOpportunity: (op: Opportunity) => void;
  onEditJob: (job: Job) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = (props) => {
  const { viewMode } = useStore();

  switch (viewMode.type) {
    case 'timeline':
      return <TimelineView {...props} />;
    case 'calendar':
      return <CalendarView {...props} />;
    case 'list':
      return <ListView {...props} />;
    case 'kanban':
    default:
      return <KanbanView {...props} />;
  }
};
