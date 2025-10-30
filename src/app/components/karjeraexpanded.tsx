// app/components/KarjeraExpanded.tsx
import { notFound } from 'next/navigation';
import { getJob } from '@/app/lib/api';
import CvForm from '@/app/components/CvForm';

type Props = { id: string };

export default async function KarjeraExpanded({ id }: Props) {
  let job = null;
  try {
    job = await getJob(id);
  } catch {
    job = null;
  }
  if (!job) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-[4vw] py-[6vh]">
      <h1 className="text-3xl font-semibold text-gray-900">{job.title}</h1>

      {job.description && (
        <p className="mt-3 text-gray-700 leading-7">{job.description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
        {job.location && (
          <div><span className="font-medium">Vieta:</span> {job.location}</div>
        )}
        {job.type && (
          <div><span className="font-medium">Tipas:</span> {job.type}</div>
        )}
        {job.salary && (
          <div><span className="font-medium">Atlyginimas:</span> {job.salary}</div>
        )}
      </div>

      {/* CV submit form */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Pateikti CV</h2>
        <CvForm jobId={job.id} />
      </section>
    </main>
  );
}
