import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit3,
  ChevronRight,
  Lock,
  User,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const INSTITUTION = {
  name: 'Trimbakeshwar Ashram Shala',
  type: 'Residential School',
  registrationNumber: 'MH-EDU-2008-4521',
  district: 'Nashik',
  taluka: 'Trimbak',
  address: 'Near Trimbakeshwar Temple Road, Trimbak, Nashik — 422212',
  phone: '+91 02594 232xxx',
  email: 'trimbak.ashramshala@example.com',
  website: '',
  primaryContact: 'Sanjay Bhosale (Principal)',
  verificationStatus: 'pending', // 'verified' | 'pending' | 'rejected'
  profileComplete: 75,
};

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'School Registration Certificate',
    type: 'PDF',
    uploadedOn: '2026-08-05',
    status: 'reviewed', // 'pending' | 'reviewed' | 'rejected'
    notes: 'Reviewed and accepted.',
  },
  {
    id: 'doc-2',
    name: 'Government Authorization Letter',
    type: 'PDF',
    uploadedOn: '2026-08-05',
    status: 'pending',
    notes: '',
  },
  {
    id: 'doc-3',
    name: 'Beneficiary Count Certificate',
    type: 'JPG',
    uploadedOn: '2026-08-06',
    status: 'rejected',
    notes: 'Document is not legible. Please re-upload a clear copy.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const DOC_STATUS = {
  pending: { label: 'Under Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  reviewed: { label: 'Accepted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
};

const VERIFICATION_STATUS = {
  verified: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: ShieldCheck },
  pending: { label: 'Verification Pending', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  rejected: { label: 'Verification Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
};

function DocStatusChip({ status }) {
  const s = DOC_STATUS[status] || DOC_STATUS.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

function DocumentCard({ doc, onDelete }) {
  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${
      doc.status === 'rejected' ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
          doc.type === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {doc.type}
        </div>
        <div>
          <p className="font-semibold text-sm text-[#1F2933] mb-0.5">{doc.name}</p>
          <p className="text-xs text-[#64707A]">Uploaded {new Date(doc.uploadedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          {doc.notes && (
            <p className={`text-xs mt-1 ${doc.status === 'rejected' ? 'text-red-700' : 'text-[#64707A]'}`}>
              {doc.status === 'rejected' ? `⚠ ${doc.notes}` : doc.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <DocStatusChip status={doc.status} />
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-slate-100 text-[#64707A] transition-colors" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          {doc.status !== 'reviewed' && (
            <button onClick={() => onDelete(doc.id)} className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InstitutionProfile() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const handleDelete = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleFileSelect = (files) => {
    const newDocs = Array.from(files).map((f) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      name: f.name.replace(/\.[^/.]+$/, ''),
      type: f.name.split('.').pop().toUpperCase().slice(0, 4),
      uploadedOn: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: '',
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const vs = VERIFICATION_STATUS[INSTITUTION.verificationStatus];
  const VsIcon = vs.icon;

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">Institution Profile</h1>
            <p className="text-sm text-[#64707A]">Manage your organization's information and verification documents.</p>
          </div>
          <Button variant="outline" icon={Edit3}>Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#304355] text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
                  TS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-[#304355]">{INSTITUTION.name}</h2>
                    {INSTITUTION.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified" />
                    )}
                  </div>
                  <p className="text-sm text-[#64707A] mb-0.5">{INSTITUTION.type}</p>
                  <p className="text-xs text-[#64707A]">Reg. No: {INSTITUTION.registrationNumber}</p>
                </div>
              </div>

              {/* Verification Status Banner */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${vs.bg} ${vs.border}`}>
                <VsIcon className={`w-5 h-5 ${vs.text} shrink-0`} />
                <div>
                  <p className={`font-semibold text-sm ${vs.text}`}>{vs.label}</p>
                  {INSTITUTION.verificationStatus === 'pending' && (
                    <p className="text-xs text-blue-600">Your profile and documents are under review. You will be notified once the review is complete.</p>
                  )}
                  {INSTITUTION.verificationStatus === 'rejected' && (
                    <p className="text-xs text-red-600">Your verification was not approved. Please review the feedback and resubmit corrected documents.</p>
                  )}
                  {INSTITUTION.verificationStatus === 'verified' && (
                    <p className="text-xs text-emerald-700">Your institution has been verified by PoshanSetu.</p>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { icon: MapPin, label: 'Address', value: INSTITUTION.address },
                  { icon: User, label: 'Primary Contact', value: INSTITUTION.primaryContact },
                  { icon: Phone, label: 'Phone', value: INSTITUTION.phone },
                  { icon: Mail, label: 'Email', value: INSTITUTION.email },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold">{item.label}</p>
                      <p className="text-[#1F2933] mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profile Completeness */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#64707A]">Profile Completeness</span>
                  <span className="font-bold text-[#304355]">{INSTITUTION.profileComplete}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#304355] h-2 rounded-full"
                    style={{ width: `${INSTITUTION.profileComplete}%` }}
                  />
                </div>
                <p className="text-xs text-[#64707A] mt-1.5">Add a website and all document types to reach 100%.</p>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-[#304355] text-lg">Verification Documents</h2>
              </div>
              <div className="flex items-start gap-2 bg-[#304355]/5 rounded-xl p-3 mb-5">
                <Lock className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                <p className="text-xs text-[#64707A] leading-relaxed">
                  Documents uploaded here are <strong>private</strong> and used exclusively for identity verification by PoshanSetu moderators. They are never shared publicly or with donors.
                </p>
              </div>

              {/* Document List */}
              <div className="space-y-3 mb-6">
                {documents.length === 0 ? (
                  <p className="text-sm text-[#64707A] text-center py-6">No documents uploaded yet.</p>
                ) : (
                  documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                  ))
                )}
              </div>

              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-[#304355] bg-[#304355]/5' : 'border-slate-300 hover:border-[#304355] hover:bg-slate-50'
                }`}
              >
                <Upload className="w-8 h-8 text-[#304355] mx-auto mb-3" />
                <p className="font-semibold text-sm text-[#1F2933] mb-1">
                  {isDragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
                </p>
                <p className="text-xs text-[#64707A]">Accepted formats: PDF, JPG, PNG — Max 5 MB per file</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Verification Guide */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-5">
              <h3 className="font-bold text-[#304355] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Verification Guide
              </h3>
              <div className="space-y-3 text-xs text-[#64707A]">
                {[
                  { label: 'Registration Certificate', done: true },
                  { label: 'Government Authorization', done: false, inProgress: true },
                  { label: 'Beneficiary Count Proof', done: false, rejected: true },
                  { label: 'Organization Letterhead (optional)', done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : item.rejected ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    ) : item.inProgress ? (
                      <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                    )}
                    <span className={item.done ? 'text-emerald-700 font-medium' : item.rejected ? 'text-red-600' : ''}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-[#304355] text-white rounded-2xl p-5">
              <Lock className="w-6 h-6 mb-2" />
              <p className="font-bold text-sm mb-1">Document Privacy</p>
              <p className="text-xs text-white/80 leading-relaxed">
                All uploaded documents are stored securely and are <strong>never shown to donors or the public</strong>. Only verified PoshanSetu moderators can access them for verification purposes.
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-4">
              <h3 className="font-bold text-sm text-[#304355] mb-3">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { label: 'My Requirements', to: '/requester/dashboard' },
                  { label: 'Notifications', to: '/notifications' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#1F2933] hover:bg-[#E8E8E2] transition-colors"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-[#64707A]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
