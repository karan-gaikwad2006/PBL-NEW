import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeader from '../../components/common/SectionHeader';
import DomainCardBase from '../../components/domain/DomainCardBase';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { districtService, requirementService } from '../../services/api';

export default function DistrictBrowse() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      districtService.getAll(),
      requirementService.getAll({ limit: 100 })
    ])
      .then(([distRes, reqRes]) => {
        if (!isMounted) return;
        const dRows = Array.isArray(distRes?.data) ? distRes.data : (Array.isArray(distRes) ? distRes : []);
        setDistricts(dRows);

        const rRows = Array.isArray(reqRes?.data) ? reqRes.data : (Array.isArray(reqRes) ? reqRes : []);
        setRequirements(rRows);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[DistrictBrowse] Error fetching data:', err);
        setError(err.message || 'Failed to load Maharashtra district records.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const districtCards = useMemo(() => {
    return districts.map((dist) => {
      const distReqs = requirements.filter((r) =>
        (r.district || '').toLowerCase().includes((dist.name || '').toLowerCase())
      );
      const activeCount = distReqs.length;

      const hasCritical = distReqs.some((r) => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
      const urgency = hasCritical ? 'HIGH' : (activeCount > 0 ? 'MEDIUM' : 'LOW');

      return {
        id: dist.id || dist.slug || dist.name,
        slug: dist.slug || dist.name.toLowerCase().replace(/\s+/g, '-'),
        title: `${dist.name} District Needs`,
        district: dist.name,
        urgency,
        beneficiariesCount: `${activeCount} Active Need${activeCount === 1 ? '' : 's'}`,
        subtitle: dist.nutritionIndicators?.length > 0
          ? `Tracked with ${dist.nutritionIndicators.length} official health indicators. ${activeCount} active requisitions logged.`
          : `Official district record for ${dist.name}. ${activeCount} active requisitions logged.`,
      };
    });
  }, [districts, requirements]);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return districtCards;
    const q = searchQuery.toLowerCase().trim();
    return districtCards.filter((c) =>
      c.district.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
    );
  }, [districtCards, searchQuery]);

  return (
    <PageContainer>
      <SectionHeader
        title="Explore Maharashtra Requirements"
        subtitle="Browse verified local food requirements and district nutrition statistics."
        badge={<Badge variant="navy" icon={MapPin}>District Discovery</Badge>}
      />

      <div className="max-w-md mb-8">
        <Input
          placeholder="Search by district name or keyword..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#304355]/10 p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#304355] mx-auto" />
          <p className="text-sm font-semibold text-[#304355]">Loading 36 Maharashtra districts data…</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-12 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-lg font-bold text-[#1F2933]">Could not load districts</h3>
          <p className="text-xs text-[#64707A] max-w-sm mx-auto">{error}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((item) => (
            <DomainCardBase
              key={item.id}
              title={item.title}
              district={item.district}
              urgency={item.urgency}
              beneficiariesCount={item.beneficiariesCount}
              subtitle={item.subtitle}
              onAction={() => navigate(`/districts/${item.slug}`)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
