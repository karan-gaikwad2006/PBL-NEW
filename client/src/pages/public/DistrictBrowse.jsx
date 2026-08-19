import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeader from '../../components/common/SectionHeader';
import DomainCardBase from '../../components/domain/DomainCardBase';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import { Search, MapPin } from 'lucide-react';

export default function DistrictBrowse() {
  const sampleDistricts = [
    { title: 'Nashik District Needs', district: 'Nashik', urgency: 'HIGH', beneficiariesCount: '450', subtitle: 'Ashram Shalas and rural centers in Nandgaon and Trimbakeshwar requiring pulses and staple grains.' },
    { title: 'Nandurbar Nutrition Support', district: 'Nandurbar', urgency: 'CRITICAL', beneficiariesCount: '820', subtitle: 'High priority nutritional requirements for pediatric support and community kitchens.' },
    { title: 'Gadchiroli Community Care', district: 'Gadchiroli', urgency: 'HIGH', beneficiariesCount: '310', subtitle: 'Local food requirements for residential schools in remote blocks.' },
    { title: 'Amravati Food Requirements', district: 'Amravati', urgency: 'MEDIUM', beneficiariesCount: '260', subtitle: 'Pulses and fortified food packet needs for maternal nutrition programs.' },
  ];

  return (
    <PageContainer>
      <SectionHeader
        title="Explore Maharashtra Requirements"
        subtitle="Browse verified local food requirements and district nutrition statistics."
        badge={<Badge variant="navy" icon={MapPin}>District Discovery</Badge>}
      />

      <div className="max-w-md mb-8">
        <Input placeholder="Search by district name or keyword..." icon={Search} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleDistricts.map((item, idx) => (
          <DomainCardBase
            key={idx}
            title={item.title}
            district={item.district}
            urgency={item.urgency}
            beneficiariesCount={item.beneficiariesCount}
            subtitle={item.subtitle}
            onAction={() => {}}
          />
        ))}
      </div>
    </PageContainer>
  );
}
