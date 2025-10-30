'use client';

import { useState } from 'react';

type Props = {
  jobId: string;
};

export default function CvForm({ jobId }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(selected.type)) {
      alert('Leidžiami tik PDF, DOC, DOCX failai.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      alert('Failas per didelis (maks. 10 MB).');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !email) {
      alert('Užpildykite visus privalomus laukus ir pridėkite CV.');
      return;
    }

    try {
      setStatus('loading');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('note', note);
      formData.append('cv', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/jobs/${jobId}/apply`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error(await res.text());
      setStatus('success');
      setName('');
      setEmail('');
      setNote('');
      setFile(null);
    } catch (err) {
      console.error('CV submit failed:', err);
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 max-w-xl"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Vardas, pavardė</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]"
          placeholder="Vardenis Pavardenis"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">El. paštas</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#14b8a6] focus:border-[#14b8a6]"
          placeholder="vardenis@pastas.lt"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          CV (PDF, DOC, DOCX, maks. 10 MB)
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full text-sm"
          required
        />
        {file && <p className="text-xs text-gray-600 mt-1">Pasirinkta: {file.name}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Žinutė (neprivaloma)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] min-h-[100px]"
          placeholder="Trumpai apie save arba motyvacija..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-lg px-5 py-2 transition disabled:opacity-60"
      >
        {status === 'loading' ? 'Siunčiama...' : 'Siųsti CV'}
      </button>

      {status === 'success' && (
        <p className="mt-2 text-green-600 text-sm">CV pateiktas sėkmingai!</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-red-600 text-sm">Įvyko klaida siunčiant CV.</p>
      )}
    </form>
  );
}
