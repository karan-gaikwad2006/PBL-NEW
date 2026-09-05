import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { institutionService, districtService } from '../../services/api';
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
  Save,
  X,
  Loader2,
} from 'lucide-react';

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
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
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
  const fileExt = (doc.fileName || doc.name || '').split('.').pop().toUpperCase().slice(0, 4) || 'DOC';
  const status = doc.reviewStatus || doc.status || 'pending';
  const uploadedDate = doc.createdAt || doc.uploadedOn || new Date();

  return (
    <div className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${
      status === 'rejected' ? 'border-red-200 bg-red-50/30' : 'border-slate-100 bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
          fileExt === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {fileExt}
        </div>
        <div>
          <p className="font-semibold text-sm text-[#1F2933] mb-0.5">{doc.fileName || doc.name}</p>
          <p className="text-xs text-[#64707A]">
            {doc.documentType ? `${doc.documentType} • ` : ''}
            Uploaded {new Date(uploadedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {doc.notes && (
            <p className={`text-xs mt-1 ${status === 'rejected' ? 'text-red-700' : 'text-[#64707A]'}`}>
              {status === 'rejected' ? `⚠ ${doc.notes}` : doc.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <DocStatusChip status={status} />
        <div className="flex items-center gap-2">
          {doc.fileUrl && (
            <button
              onClick={() => window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')}
              className="p-1 rounded hover:bg-slate-100 text-[#304355] transition-colors"
              title="Preview / View Document"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {status !== 'verified' && (
            <button
              onClick={() => onDelete(doc.id)}
              className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
              title="Remove Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InstitutionProfile() {
  const { firebaseUser, user: currentUser } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    organization_type: '',
    description: '',
    district_id: '',
    address: '',
    contact_email: '',
    contact_phone: '',
  });

  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!firebaseUser) return;
      try {
        setLoading(true);
        const token = await firebaseUser.getIdToken();
        const [instRes, distRes] = await Promise.all([
          institutionService.getMine(token),
          districtService.getAll()
        ]);
        
        if (instRes.data) {
          setInstitution(instRes.data);
          setDocuments(instRes.data.documents || []);
          setFormData({
            name: instRes.data.name || '',
            organization_type: instRes.data.organization_type || '',
            description: instRes.data.description || '',
            district_id: instRes.data.district_id || '',
            address: instRes.data.address || '',
            contact_email: instRes.data.contact_email || '',
            contact_phone: instRes.data.contact_phone || '',
          });
        }
        setDistricts(distRes.data || []);
      } catch (err) {
        console.error('Failed to fetch institution profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firebaseUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setSaving(true);
      setError(null);
      const token = await firebaseUser.getIdToken();
      
      let res;
      if (institution) {
        res = await institutionService.updateMine(token, formData);
      } else {
        res = await institutionService.create(token, formData);
      }
      
      setInstitution(res.data);
      if (res.data.documents) {
        setDocuments(res.data.documents);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save institution profile:', err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await institutionService.deleteDocument(token, id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError(err.message || 'Failed to remove document.');
    }
  };

  const handleFileSelect = async (files) => {
    if (!firebaseUser || !files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const token = await firebaseUser.getIdToken();
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.append('file', file);
        data.append('documentType', 'Registration Certificate');
        const res = await institutionService.uploadDocument(token, data);
        if (res.data) {
          setDocuments((prev) => [res.data, ...prev]);
        }
      }
      // Re-fetch profile to update verification status if updated
      const instRes = await institutionService.getMine(token);
      if (instRes.data) {
        setInstitution(instRes.data);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload document. Please ensure it is a PDF/PNG/JPG under 5MB.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>

        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#304355] animate-spin" />
        </div>
      </PageContainer>
    );
  }

  const vs = VERIFICATION_STATUS[institution?.verification_status || 'pending'];
  const VsIcon = vs.icon;

  // Calculate completeness
  const profileComplete = institution ? Math.round(
    ([
      institution.name,
      institution.organization_type,
      institution.description,
      institution.district_id,
      institution.address,
      institution.contact_email,
      institution.contact_phone
    ].filter(Boolean).length / 7) * 100
  ) : 0;

  return (
    <PageContainer>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#304355] mb-1 tracking-tight">Institution Profile</h1>
            <p className="text-sm text-[#64707A]">Manage your organization's information and verification documents.</p>
          </div>
          {!isEditing && (
            <Button variant="outline" icon={Edit3} onClick={() => setIsEditing(true)}>
              {institution ? 'Edit Profile' : 'Create Profile'}
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-[#304355]/10 shadow-sm p-6">
              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64707A] uppercase">Institution Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64707A] uppercase">Organization Type</label>
                      <input
                        type="text"
                        value={formData.organization_type}
                        onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                        placeholder="e.g. NGO, School, Ashram Shala"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64707A] uppercase">District</label>
                      <select
                        value={formData.district_id}
                        onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none"
                      >
                        <option value="">Select District</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64707A] uppercase">Contact Phone</label>
                      <input
                        type="text"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#64707A] uppercase">Contact Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64707A] uppercase">Full Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none h-20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#64707A] uppercase">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#304355] outline-none h-24"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" icon={X} onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
                    <Button variant="primary" icon={saving ? Loader2 : Save} type="submit" loading={saving}>
                      {institution ? 'Save Changes' : 'Create Profile'}
                    </Button>
                  </div>
                </form>
              ) : institution ? (
                <>
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#304355] text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
                      {institution.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-[#304355]">{institution.name}</h2>
                        {institution.verification_status === 'verified' && (
                          <ShieldCheck className="w-5 h-5 text-emerald-500" title="Verified" />
                        )}
                      </div>
                      <p className="text-sm text-[#64707A] mb-0.5">{institution.organization_type}</p>
                      <p className="text-xs text-[#64707A]">{institution.description}</p>
                    </div>
                  </div>

                  {/* Verification Status Banner */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${vs.bg} ${vs.border}`}>
                    <VsIcon className={`w-5 h-5 ${vs.text} shrink-0`} />
                    <div>
                      <p className={`font-semibold text-sm ${vs.text}`}>{vs.label}</p>
                      {institution.verification_status === 'pending' && (
                        <p className="text-xs text-blue-600">Your profile and documents are under review. You will be notified once the review is complete.</p>
                      )}
                      {institution.verification_status === 'rejected' && (
                        <p className="text-xs text-red-600">Your verification was not approved. Please review the feedback and resubmit corrected documents.</p>
                      )}
                      {institution.verification_status === 'verified' && (
                        <p className="text-xs text-emerald-700">Your institution has been verified by PoshanSetu.</p>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      { icon: MapPin, label: 'Address', value: `${institution.address || ''} ${institution.district_name ? `, ${institution.district_name}` : ''}` },
                      { icon: Phone, label: 'Phone', value: institution.contact_phone },
                      { icon: Mail, label: 'Email', value: institution.contact_email },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3">
                        <item.icon className="w-4 h-4 text-[#304355] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-[#64707A] uppercase tracking-wider font-semibold">{item.label}</p>
                          <p className={`text-[#1F2933] mt-0.5 ${!item.value && 'italic text-slate-400'}`}>{item.value || 'Not provided'}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Profile Completeness */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#64707A]">Profile Completeness</span>
                      <span className="font-bold text-[#304355]">{profileComplete}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-[#304355] h-2 rounded-full"
                        style={{ width: `${profileComplete}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#304355] mb-2">No Institution Profile Found</h3>
                  <p className="text-sm text-[#64707A] mb-6">Create a profile to represent your organization and submit requirements.</p>
                  <Button variant="primary" onClick={() => setIsEditing(true)}>Create Institution Profile</Button>
                </div>
              )}
            </div>

            {/* Documents Section (UI Only for now as per prompt) */}
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
                  { label: 'Registration Certificate', done: documents.length > 0 },
                  { label: 'Government Authorization', done: false, inProgress: documents.length > 0 },
                  { label: 'Beneficiary Count Proof', done: false },
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
