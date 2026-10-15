import React, { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { requirementService } from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';

const REASONS = [
  ['asks_money_outside_platform', 'Asks for money outside the platform'],
  ['wrong_beneficiary', 'Wrong beneficiary'],
  ['fake_urgency', 'Fake urgency'],
  ['other', 'Other'],
];

export default function ReportButton({ requirementId }) {
  const { firebaseUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0][0]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState(false);

  if (hidden || !requirementId) return null;

  const close = () => {
    setOpen(false);
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!firebaseUser) {
      setMessage('Please sign in to report this requirement.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const token = await firebaseUser.getIdToken();
      await requirementService.report(token, requirementId, { reason, note: note.trim() || undefined });
      setMessage('Thank you. Your report has been submitted.');
    } catch (error) {
      if (error.message === 'You have already reported this requirement.') {
        setMessage(error.message);
      } else if (/own requirement/i.test(error.message)) {
        setHidden(true);
        setOpen(false);
      } else {
        setMessage(error.message || 'Unable to submit your report. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#64707A] hover:text-[#304355] hover:underline"
      >
        <Flag className="h-3.5 w-3.5" />
        Report
      </button>
      <Modal isOpen={open} onClose={close} title="Report this requirement" subtitle="Reports are reviewed automatically to adjust search visibility.">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold text-[#304355]">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#304355]">
            Note <span className="font-normal text-[#64707A]">(optional, up to 300 characters)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 300))}
              maxLength={300}
              rows={4}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </label>
          {message && <p role="status" className="text-sm text-[#304355]">{message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={close}>Close</Button>
            {!message.startsWith('Thank you') && (
              <Button type="submit" disabled={busy} icon={busy ? Loader2 : Flag}>
                {busy ? 'Submitting…' : 'Submit report'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
