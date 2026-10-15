import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, ShieldCheck, Upload } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { userService } from '../../services/api';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
};

export default function AccountProfile() {
  const { firebaseUser, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDocuments = useCallback(async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await userService.getDocuments(token);
    setDocuments(response.data || []);
  }, [firebaseUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadDocuments();
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load profile documents.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadDocuments]);

  const documentType = user?.role === 'institution' ? 'PAN card' : 'Aadhaar card';

  const upload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.document.files[0];
    if (!file) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const token = await firebaseUser.getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      await userService.uploadDocument(token, formData);
      await loadDocuments();
      form.reset();
      setNotice('Document uploaded securely and is awaiting in-app review.');
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload the document.');
    } finally {
      setBusy(false);
    }
  };

  const openDocument = async (id) => {
    const documentWindow = window.open('about:blank', '_blank');
    if (!documentWindow) {
      setError('Allow pop-ups to open this private document.');
      return;
    }
    documentWindow.opener = null;
    try {
      const token = await firebaseUser.getIdToken();
      const response = await userService.getDocumentAccess(token, id);
      documentWindow.location.replace(response.data.accessUrl);
    } catch (accessError) {
      documentWindow.close();
      setError(accessError.message || 'Unable to open this document.');
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to={user?.role === 'donor' ? '/donor/dashboard' : user?.role === 'institution' ? '/institution/dashboard' : '/requester/dashboard'} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#304355]">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-[#304355]">My profile</h1>
        <p className="mt-1 text-sm text-[#64707A]">Your account details and documents submitted for in-app verification.</p>

        <section className="mt-6 rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#304355]">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="font-bold">Account details</h2>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-[#64707A]">Name</dt><dd className="font-semibold text-[#1F2933]">{user?.full_name || '—'}</dd></div>
            <div><dt className="text-[#64707A]">Email</dt><dd className="font-semibold text-[#1F2933]">{user?.email || '—'}</dd></div>
            <div><dt className="text-[#64707A]">Role</dt><dd className="font-semibold capitalize text-[#1F2933]">{user?.role || '—'}</dd></div>
          </dl>
        </section>

        <section className="mt-5 rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#304355]">
            <FileText className="h-5 w-5" />
            <h2 className="font-bold">Identity documents</h2>
          </div>
          <p className="mb-4 text-sm text-[#64707A]">
            Upload a {documentType}. Documents are stored as private files and are accessible only to you and admins reviewing your account or requirement.
          </p>
          <form onSubmit={upload} className="flex flex-wrap items-end gap-3">
            <label className="min-w-64 flex-1 text-sm font-semibold text-[#304355]">
              {documentType}
              <input
                name="document"
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="mt-1.5 block w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </label>
            <Button type="submit" disabled={busy} icon={busy ? Loader2 : Upload}>
              {busy ? 'Uploading…' : 'Upload document'}
            </Button>
          </form>
          {notice && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{notice}</p>}
          {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[#64707A]"><Loader2 className="h-4 w-4 animate-spin" /> Loading documents…</div>
          ) : documents.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-[#64707A]">No documents uploaded yet.</p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100">
              {documents.map((document) => (
                <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#304355]">{document.fileName}</p>
                    <p className="text-xs capitalize text-[#64707A]">{document.documentType} · {new Date(document.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[document.reviewStatus] || STATUS_STYLES.pending}`}>
                      {document.reviewStatus}
                    </span>
                    <button type="button" onClick={() => openDocument(document.id)} className="text-xs font-semibold text-[#304355] underline">Open securely</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
