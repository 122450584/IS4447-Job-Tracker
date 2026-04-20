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
  const request = new AbortController();
  const timeoutId = setTimeout(() => request.abort(), 10000);

  try {
    const response = await fetch(buildJobLeadsUrl(searchText), { signal: request.signal });

    if (!response.ok) {
      throw new Error('Job leads could not be loaded.');
    }

    const data = (await response.json()) as RemotiveResponse;
    const query = searchText.trim().toLowerCase();
    const leads = (data.jobs ?? []).map(mapJobLead);

    if (!query) {
      return leads;
    }

    return leads.filter((lead) =>
      [lead.title, lead.companyName, lead.category, lead.location, lead.jobType ?? '', lead.salary ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Job leads request timed out. Check your connection and try again.');
    }

    if (err instanceof Error) {
      throw err;
    }

    throw new Error('Job leads could not be loaded.');
  } finally {
    clearTimeout(timeoutId);
  }
}
