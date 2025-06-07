import { opportunityService } from './opportunityService';
import { jobService } from './jobService';

export const exportService = {
  async exportPipelineCSV() {
    try {
      const { data: opportunities } = await opportunityService.getAll();
      const { data: jobs } = await jobService.getAll();
      const rows: Record<string, any>[] = [];

      opportunities?.forEach(o => {
        rows.push({
          type: 'Opportunity',
          id: o.id,
          name: o.name,
          value: o.value,
          stage: o.stage,
          probability: o.probability,
          created_at: o.created_at
        });
      });

      jobs?.forEach(j => {
        rows.push({
          type: 'Job',
          id: j.id,
          name: j.name,
          value: j.value,
          stage: j.stage,
          project_status: j.project_status,
          created_at: j.created_at
        });
      });

      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(row =>
          headers
            .map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting pipeline data:', error);
    }
  }
};
