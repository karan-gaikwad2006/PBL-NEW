import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeader from '../../components/common/SectionHeader';
import Card, { CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { LayoutDashboard, HeartHandshake, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  return (
    <PageContainer>
      <SectionHeader
        title="Donor Dashboard"
        subtitle="Track your active support offers, pending confirmations, and completed donations."
        badge={<Badge variant="primary" icon={LayoutDashboard}>Dashboard Overview</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#64707A] font-medium">Active Supports</span>
              <span className="block text-2xl font-extrabold text-[#1F2933]">0</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#64707A] font-medium">Pending Confirmations</span>
              <span className="block text-2xl font-extrabold text-[#1F2933]">0</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#64707A] font-medium">Completed Donations</span>
              <span className="block text-2xl font-extrabold text-[#1F2933]">0</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <EmptyState
        title="No active support activities yet"
        description="You have not offered support to any local requirements yet. Explore requirements across Maharashtra to get started."
        actionText="Explore Requirements"
        onAction={() => {}}
      />
    </PageContainer>
  );
}
