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
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Resumes</h1>
          <div className="flex gap-2">
            <button onClick={onGoHome} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700">Home</button>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="p-4 border rounded bg-white dark:bg-gray-900">No resumes yet. Create one from Home.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-2 border">Name</th>
                  <th className="text-left p-2 border">Updated</th>
                  <th className="text-left p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 border">
                      {renamingId === r.id ? (
                        <div className="flex gap-2">
                          <input value={newName} onChange={(e) => setNewName(e.target.value)} className="p-2 border rounded flex-1" placeholder={r.name} />
                          <button onClick={() => handleRename(r.id)} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                          <button onClick={() => { setRenamingId(null); setNewName(''); }} className="px-3 py-2 bg-gray-500 text-white rounded">Cancel</button>
                        </div>
                      ) : (
                        <span>{r.name}</span>
                      )}
                    </td>
                    <td className="p-2 border">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''}</td>
                    <td className="p-2 border">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onOpenResume(r.id)} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Open</button>
                        {renamingId !== r.id && (
                          <button onClick={() => { setRenamingId(r.id); setNewName(r.name); }} className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Rename</button>
                        )}
                        <button onClick={() => handleDuplicate(r.id)} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Save As</button>
                        {/* Direct PDF download using @react-pdf/renderer */}
                        <PDFDownloadLink document={<ResumeDocument formData={r.data} />} fileName={`${(r.name || 'resume')}.pdf`}>
                          {({ loading }) => (
                            <button disabled={loading} className={`px-3 py-2 text-white rounded ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gray-700 hover:bg-gray-800'}`}>
                              {loading ? 'Preparing…' : 'Download PDF'}
                            </button>
                          )}
                        </PDFDownloadLink>
                        <button onClick={() => handleDelete(r.id)} className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
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
  );
}

export default ManageResumesPage;


