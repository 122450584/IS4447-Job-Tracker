import { AppScreen } from '@/components/app-screen';
import { JobLeadsList } from '@/components/job-leads-list';

export default function LeadsScreen() {
  return (
    <AppScreen
      title="Job Leads"
      description="Browse public remote job listings before deciding what to track locally.">
      <JobLeadsList />
    </AppScreen>
  );
}
