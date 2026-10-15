import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function OfficialChannelNotice() {
  return (
    <aside className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
      <p>
        Donate only through the contact details listed here. PoshanSetu never asks for money through personal UPI IDs or WhatsApp links.
      </p>
    </aside>
  );
}
