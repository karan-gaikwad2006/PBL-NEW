import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, FileText, Loader2, RefreshCw, ShieldCheck, Upload } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import TrustBadge from '../../components/trust/TrustBadge';
import useAuth from '../../hooks/useAuth';
import { institutionService, requirementService, userService } from '../../services/api';
import { RequirementCard } from './RequesterDashboard';

const FCRA_OPTIONS = ['not_applicable', 'registered', 'none'];
const REASON_LABELS = {
  asks_money_outside_platform: 'Asks for money outside the platform',
  wrong_beneficiary: 'Wrong beneficiary',
  fake_urgency: 'Fake urgency',
  other: 'Other',
};

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InstitutionDashboard() {
  const { firebaseUser } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [identityDocuments, setIdentityDocuments] = useState([]);
  const [form, setForm] = useState({ darpan_id: '', section_80g: false, section_12a: false, fcra_status: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const [institutionResponse, requirementResponse, documentResponse] = await Promise.all([
      institutionService.getMine(token),
      requirementService.getMine(token),
      userService.getDocuments(token),
    ]);
    const currentInstitution = institutionResponse.data;
    setInstitution(currentInstitution);
    setRequirements(requirementResponse.data || []);
    setIdentityDocuments(documentResponse.data || []);
    if (currentInstitution) {
      setForm({
        darpan_id: currentInstitution.darpan_id || '',
        section_80g: Boolean(currentInstitution.section_80g),
        section_12a: Boolean(currentInstitution.section_12a),
        fcra_status: currentInstitution.fcra_status || '',
      });
    }
  }, [firebaseUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load institution dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  const saveOfficialDetails = async (event) => {
    event.preventDefault();
    if (!firebaseUser || !institution) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const token = await firebaseUser.getIdToken();
      const response = await institutionService.updateMine(token, form);
      setInstitution((previous) => ({ ...previous, ...response.data }));
      setNotice('Official details saved.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save official details.');
    } finally {
      setSaving(false);
    }
  };

  const tierSet = new Set(institution?.trust?.tiers || []);
  const identityVerified = identityDocuments.some((document) => document.reviewStatus === 'verified');
  const verificationStatus = institution?.verification_status || 'pending';
  const reportCounts = institution?.reportCounts || [];

  if (loading) {
    return <PageContainer><div className="flex justify-center py-24 text-[#64707A]"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading institution dashboard…</div></PageContainer>;
  }

  return (
    <PageContainer>
      <main className="mx-auto max-w-[1280px] space-y-6 px-6 py-10 md:px-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#64707A]"><Building2 className="h-4 w-4" /> Institution workspace</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#304355]">{institution?.name || 'Institution dashboard'}</h1>
            <div className="mt-3"><TrustBadge tiers={institution?.trust?.tiers} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/profile"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-[#304355]/15 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#304355]/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#304355]"
            >
              <span className="rounded-lg bg-[#304355]/5 p-2 text-[#304355] transition group-hover:bg-[#304355]/10">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-bold text-[#304355]">Account profile</span>
                <span className="block text-xs text-[#64707A]">PAN & identity documents</span>
              </span>
              <FileText className="h-4 w-4 text-[#64707A]" />
            </Link>
            <Link to="/institution-profile" className="rounded-lg bg-[#304355] px-4 py-2.5 text-sm font-semibold text-white">Edit institution profile</Link>
            <Link to="/submit-need" className="rounded-lg border border-[#304355]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#304355]">Submit requirement</Link>
          </div>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
        {!institution && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Create an institution profile before editing official details or posting institution requirements.
            <Link to="/institution-profile" className="ml-2 font-bold underline">Set up profile</Link>
          </div>
        )}

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#304355]" /><h2 className="font-bold text-[#304355]">Verification</h2></div>
            <p className="mb-2 text-sm text-[#64707A]">Status: <strong className="capitalize text-[#304355]">{verificationStatus.replaceAll('_', ' ')}</strong></p>
            <p className="mb-4 text-xs text-[#64707A]">Verification renewal due: {formatDate(institution?.verification_renewal_due)}</p>
            <div className="space-y-2">
              {(institution?.documents || []).map((document) => (
                <p key={document.id} className="flex items-center gap-2 text-sm text-[#304355]"><FileText className="h-4 w-4" />{document.fileName} · {document.reviewStatus}</p>
              ))}
              {identityDocuments.map((document) => (
                <p key={document.id} className="flex items-center gap-2 text-sm text-[#304355]"><FileText className="h-4 w-4" />{document.fileName} · {document.reviewStatus}</p>
              ))}
              {!(institution?.documents?.length || identityDocuments.length) && <p className="text-sm text-[#64707A]">No documents uploaded yet.</p>}
            </div>
            {['rejected', 'renewal_required', 'pending'].includes(verificationStatus) && (
              <Link to="/institution-profile" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#304355] underline"><Upload className="h-4 w-4" /> Upload or resubmit documents</Link>
            )}
          </article>

          <article className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-[#304355]" /><h2 className="font-bold text-[#304355]">Verification renewal</h2></div>
            <p className="text-sm text-[#64707A]">Renewal date: <strong className="text-[#304355]">{formatDate(institution?.verification_renewal_due)}</strong></p>
            {verificationStatus === 'renewal_required' && <p className="mt-3 text-sm text-amber-800">Please resubmit documents for in-app admin review.</p>}
            <Link to="/institution-profile" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#304355] underline"><Upload className="h-4 w-4" /> Go to document upload</Link>
          </article>
        </section>

        <section className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-[#304355]" /><h2 className="font-bold text-[#304355]">Official organization details</h2></div>
          <form onSubmit={saveOfficialDetails} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-[#304355]">NGO DARPAN ID (optional)
              <input value={form.darpan_id} onChange={(event) => setForm({ ...form, darpan_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-semibold text-[#304355]">FCRA status (optional)
              <select value={form.fcra_status} onChange={(event) => setForm({ ...form, fcra_status: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                <option value="">Not provided</option>
                {FCRA_OPTIONS.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-[#304355]"><input type="checkbox" checked={form.section_80g} onChange={(event) => setForm({ ...form, section_80g: event.target.checked })} /> Section 80G registered</label>
            <label className="flex items-center gap-2 text-sm text-[#304355]"><input type="checkbox" checked={form.section_12a} onChange={(event) => setForm({ ...form, section_12a: event.target.checked })} /> Section 12A registered</label>
            <div className="md:col-span-2"><Button type="submit" disabled={saving || !institution}>{saving ? 'Saving…' : 'Save official details'}</Button></div>
          </form>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-[#304355]">Trust progress</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">{tierSet.has('document_verified') ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />}Document verified: institution documents reviewed in-app by an admin.</li>
              <li className="flex items-start gap-2">{identityVerified ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />}Identity document review: {identityVerified ? 'complete' : 'awaiting admin review'}.</li>
              <li className="flex items-start gap-2">{tierSet.has('track_record') ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock className="h-4 w-4 text-amber-600" />}Track record: confirmed fulfilments and no open disputes.</li>
            </ul>
            <p className="mt-4 text-xs text-[#64707A]">Phone or OTP verification is not used; document review is handled in-app.</p>
          </article>
          <article className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-[#304355]">Reports received</h2>
            {reportCounts.length ? (
              <ul className="space-y-2 text-sm text-[#304355]">
                {reportCounts.map((entry) => <li key={entry.reason} className="flex justify-between gap-4"><span>{REASON_LABELS[entry.reason] || entry.reason}</span><span className="font-bold">{entry.count}</span></li>)}
              </ul>
            ) : <p className="text-sm text-[#64707A]">No reports to summarize.</p>}
            <p className="mt-3 text-xs text-[#64707A]">Reporter identities are not shown.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-bold text-[#304355]">Requirements</h2>
            {institution?.postingLimits && <span className="text-xs text-[#64707A]">{institution.postingLimits.remaining} of {institution.postingLimits.daily} posts remain today</span>}
          </div>
          {requirements.length ? <div className="grid gap-4 lg:grid-cols-2">{requirements.map((requirement) => <RequirementCard key={requirement.id} req={requirement} />)}</div> : <p className="text-sm text-[#64707A]">No requirements yet. <Link to="/submit-need" className="font-semibold underline">Submit a requirement</Link>.</p>}
        </section>

        <section className="rounded-2xl border border-[#304355]/10 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-[#304355]">Community vouches</h2>
          <p className="mt-2 text-2xl font-extrabold text-[#304355]">{institution?.vouchCount || 0}</p>
          <p className="text-xs text-[#64707A]">Number of donors who vouched; donor identities are not displayed.</p>
        </section>
      </main>
    </PageContainer>
  );
}
