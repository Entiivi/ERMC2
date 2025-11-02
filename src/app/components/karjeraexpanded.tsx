// app/components/KarjeraExpanded.tsx  (SERVER)
import { notFound } from "next/navigation";
import { getJob } from "@/app/lib/api";
import CvForm from "@/app/components/CvForm";

type JobDTO = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: string | null;
  postedAt: string;          // ISO string from API
  responsibilities: string[]; // normalized in API
  cover?: string | null;     // optional, if you add later
  link?: string | null;      // optional, if you add later
};

type Props = { id: string };

export default async function KarjeraExpanded({ id }: Props) {
  let job: JobDTO | null = null;

  try {
    job = await getJob(id);      // should call /darbas/:id under the hood
  } catch (e) {
    console.error("getJob failed:", e);
    job = null;
  }

  if (!job) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-[4vw] py-[6vh]">
      {/* Title + date */}
      <div className="mb-3">
        <time className="block text-xs text-gray-500">
          {new Date(job.postedAt).toLocaleDateString("lt-LT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
        <h1 className="text-3xl font-semibold text-gray-900">{job.title}</h1>
      </div>

      {/* Description */}
      {job.description && (
        <p className="mt-3 text-gray-700 leading-7 whitespace-pre-wrap">
          {job.description}
        </p>
      )}

      {/* Meta */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
        {job.location && (
          <div>
            <span className="font-medium">Vieta:</span> {job.location}
          </div>
        )}
        {job.type && (
          <div>
            <span className="font-medium">Tipas:</span> {job.type}
          </div>
        )}
        {job.salary && (
          <div>
            <span className="font-medium">Atlyginimas:</span> {job.salary}
          </div>
        )}
      </div>

      {/* Responsibilities */}
      {job.responsibilities?.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Atsakomybės</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-800">
            {job.responsibilities.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CV submit form */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Pateikti CV</h2>
        <CvForm jobId={job.id} />
      </section>

      {/* Optional external link */}
      {job.link && (
        <div className="pt-8">
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-100"
          >
            Plačiau apie poziciją <span aria-hidden>↗</span>
          </a>
        </div>
      )}
    </main>
  );
}
