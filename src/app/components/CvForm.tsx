'use client';

import { useState } from 'react';

type Props = {
  jobId: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function CvForm({ jobId }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      formData.append('phone', phone);
      formData.append('note', note);
      formData.append('cv', file);

      const res = await fetch(`${API}/paraiskos/${jobId}/apply`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      setStatus('success');
      setName('');
      setEmail('');
      setPhone('');
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
      className="bg-white p-6 rounded-2xl shadow-md max-w-xl"
    >
      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Vardas, pavardė</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
          placeholder="Vardenis Pavardenis"
          required
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">El. paštas</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
          placeholder="vardenis@pastas.lt"
          required
        />
      </div>

      {/* 📞 Phone */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Telefono numeris (neprivaloma)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
          placeholder="+370 600 12345"
        />
      </div>

      {/* CV Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          CV (PDF, DOC, DOCX, maks. 10 MB)
        </label>

        <div className="flex items-center gap-[3vw] mt-2">
          <label
            htmlFor="cv-upload"
            className="hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
          >
            Įkelti
          </label>

          <input
            id="cv-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            required
          />

          {/* File name or fallback */}
          <p className="text-[1.5vh] text-gray-600 truncate max-w-[50vw]">
            {file ? `Pasirinkta: ${file.name}` : "Nepasirinkote failo..."}
          </p>
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Žinutė (neprivaloma)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] min-h-[100px]"
          placeholder="Trumpai apie save arba motyvacija..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-center mt-6">
        <span
          onClick={status !== 'loading' ? handleSubmit : undefined}
          role="button"
          tabIndex={0}
          aria-disabled={status === 'loading'}
          className="pt-[1vh] text-[3vh] hover:scale-105 hover:text-[#14b8a6] transition duration-200 px-6 py-3 cursor-pointer select-none text-gray-800 rounded-full shadow-md hover:bg-blue-700 transition duration-300"
        >
          {status === 'loading' ? 'Siunčiama...' : 'Siųsti CV'}
        </span>
      </div>

      {status === 'success' && (
        <p className="mt-2 text-green-600 text-sm">CV pateiktas sėkmingai!</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-red-600 text-sm">Įvyko klaida siunčiant CV.</p>
      )}
    </form>
  );
}
