import React, { useEffect, useState } from 'react';
import { listResumes, deleteResume, duplicateResume, renameResume } from '../utils/resumeDb';
import { logger } from '../utils/logger';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ResumeDocument from './ResumeDocument';

/**
 * ManageResumesPage
 * Lists all saved resumes from IndexedDB with actions: open, rename, duplicate (Save As), delete, download.
 *
 * Why: Central place for users to manage multiple resume files.
 * How: Load from resumeDb, render table, emit callbacks to open a record in the builder.
 */
function ManageResumesPage({ onGoHome, onOpenResume }) {
  const [resumes, setResumes] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState('');

  const refresh = async () => {
    const all = await listResumes();
    setResumes(all);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRename = async (id) => {
    try {
      const final = (newName || '').trim();
      if (!final) { setRenamingId(null); setNewName(''); return; }
      const rec = await renameResume(id, final);
      logger.info('Renamed resume', { id, name: rec.name });
      setRenamingId(null);
      setNewName('');
      await refresh();
    } catch (err) {
      logger.error('Rename failed', { message: err?.message });
      alert('Rename failed. Try a different name.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const created = await duplicateResume(id);
      logger.info('Duplicated resume', { from: id, to: created.id });
      await refresh();
    } catch (err) {
      logger.error('Duplicate failed', { message: err?.message });
      alert('Could not duplicate resume.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume permanently?')) return;
    try {
      await deleteResume(id);
      await refresh();
    } catch (err) {
      logger.error('Delete failed', { message: err?.message });
      alert('Delete failed.');
    }
  };

  const handleDownload = async (rec) => {
    try {
      // Download JSON for now; PDF download is available in builder preview.
      const blob = new Blob([JSON.stringify(rec.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.name || 'resume'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('Download failed', { message: err?.message });
    }
  };

  return (
    <div className="min-h-screen app-gradient">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-14">
        {/* Header with subtle gradient and glow */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-emerald-600/20 p-1 shadow-lg">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur px-5 py-4 ring-1 ring-black/5">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Manage Resumes</h1>
              <p className="text-sm opacity-80">Organize, rename, duplicate, download, and open your resumes.</p>
            </div>
            <button
              onClick={onGoHome}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow hover:shadow-xl transition-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Home
            </button>
          </div>
        </div>

        {/* Card container for table */}
        <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur shadow-2xl ring-1 ring-black/5 p-4">
          {resumes.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-xl bg-white/60 dark:bg-gray-900/40">
              <div className="text-5xl mb-3">📝</div>
              <div className="font-medium">No resumes yet</div>
              <div className="text-sm opacity-80">Create one from the Home page to get started.</div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Updated</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {resumes.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-base">
                      <td className="p-3 align-middle">
                        {renamingId === r.id ? (
                          <div className="flex gap-2">
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-1 p-2 border rounded-lg bg-white/80 dark:bg-gray-900/70" placeholder={r.name} />
                            <button onClick={() => handleRename(r.id)} className="px-3 py-2 rounded-full bg-emerald-600 text-white shadow hover:shadow-xl hover-glow-emerald transition-base">Save</button>
                            <button onClick={() => { setRenamingId(null); setNewName(''); }} className="px-3 py-2 rounded-full bg-gray-500 text-white shadow hover:shadow-xl transition-base">Cancel</button>
                          </div>
                        ) : (
                          <span className="font-medium">{r.name}</span>
                        )}
                      </td>
                      <td className="p-3 align-middle opacity-80">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''}</td>
                      <td className="p-3 align-middle">
                        {/* Action buttons: rounded pills with soft glow */}
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => onOpenResume(r.id)} className="px-3 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:shadow-xl hover-glow-primary transition-base">Open</button>
                          {renamingId !== r.id && (
                            <button onClick={() => { setRenamingId(r.id); setNewName(r.name); }} className="px-3 py-2 rounded-full bg-amber-500 text-white shadow hover:shadow-xl transition-base">Rename</button>
                          )}
                        <button onClick={() => handleDuplicate(r.id)} className="px-3 py-2 rounded-full bg-emerald-600 text-white shadow hover:shadow-xl hover-glow-emerald transition-base">Save As</button>
                        <button onClick={() => handleDuplicate(r.id)} className="px-3 py-2 rounded-full bg-blue-600 text-white shadow hover:shadow-xl transition-base">Duplicate</button>
                          <PDFDownloadLink document={<ResumeDocument formData={r.data} />} fileName={`${(r.name || 'resume')}.pdf`}>
                            {({ loading }) => (
                              <button disabled={loading} className={`px-3 py-2 rounded-full text-white shadow transition-base ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gray-700 hover:shadow-xl hover:bg-gray-800'}`}>
                                {loading ? 'Preparing…' : 'Download PDF'}
                              </button>
                            )}
                          </PDFDownloadLink>
                          <button onClick={() => handleDelete(r.id)} className="px-3 py-2 rounded-full bg-red-600 text-white shadow hover:shadow-xl transition-base">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageResumesPage;


