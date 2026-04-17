export type JobLead = {
  id: number;
  title: string;
  companyName: string;
  category: string;
  jobType: string | null;
  location: string;
  salary: string | null;
  publicationDate: string;
  url: string;
};

type RemotiveJob = {
  id: number;
  title: string;
  company_name: string;
  category: string;
  job_type?: string | null;
  candidate_required_location?: string | null;
  salary?: string | null;
  publication_date: string;
  url: string;
};

type RemotiveResponse = {
  jobs?: RemotiveJob[];
};

const remotiveEndpoint = 'https://remotive.com/api/remote-jobs';

function buildJobLeadsUrl(searchText: string) {
  const params = new URLSearchParams({
    limit: '10',
  });
  const query = searchText.trim();

  if (query) {
    params.set('search', query);
  }

  return `${remotiveEndpoint}?${params.toString()}`;
}

function mapJobLead(job: RemotiveJob): JobLead {
  return {
    id: job.id,
    title: job.title,
    companyName: job.company_name,
    category: job.category,
    jobType: job.job_type || null,
    location: job.candidate_required_location || 'Remote',
    salary: job.salary || null,
    publicationDate: job.publication_date,
    url: job.url,
  };
}

export async function fetchJobLeads(searchText: string): Promise<JobLead[]> {
  const response = await fetch(buildJobLeadsUrl(searchText));

  if (!response.ok) {
    throw new Error('Job leads could not be loaded.');
  }

  const data = (await response.json()) as RemotiveResponse;

  return (data.jobs ?? []).map(mapJobLead);
}
