import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function AuthPage() {
  return (
    <PageContainer maxWidth="max-w-md">
      <Card className="shadow-md">
        <CardHeader className="text-center justify-center flex-col py-6 bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-[#304355] text-white flex items-center justify-center mb-2 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1F2933]">Sign In to PoshanSetu</h2>
          <p className="text-xs text-[#64707A] mt-1">Access your donor or requester dashboard</p>
        </CardHeader>

        <CardBody className="p-6 space-y-4">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail} required />
            <Input label="Password" type="password" placeholder="••••••••" icon={Lock} required />

            <Button variant="primary" type="submit" className="w-full" icon={LogIn}>
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
