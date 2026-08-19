import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import FormLayout from '../../components/common/FormLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';

export default function RequirementSubmit() {
  return (
    <PageContainer>
      <FormLayout
        title="Submit Local Food Requirement"
        description="Step 1 of 7: Requester Identity and Organization Details"
        currentStep={1}
        totalSteps={7}
        footer={
          <div className="flex justify-between w-full">
            <Button variant="ghost" disabled>Back</Button>
            <Button variant="primary">Continue to Location</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name / Representative Name" placeholder="e.g. Rahul Sharma" required />
          <Input label="Organization / Institution Name" placeholder="e.g. Ashram Shala Trimbak" required />
          <Select label="District in Maharashtra" required>
            <option value="">Select District</option>
            <option value="nashik">Nashik</option>
            <option value="nandurbar">Nandurbar</option>
            <option value="gadchiroli">Gadchiroli</option>
            <option value="amravati">Amravati</option>
          </Select>
          <TextArea label="Brief Description of Institution / Need" placeholder="Explain the context of beneficiaries and food requirements..." rows={3} />
        </form>
      </FormLayout>
    </PageContainer>
  );
}
