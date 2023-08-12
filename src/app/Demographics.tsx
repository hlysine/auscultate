import React from 'react';
import { Patient } from '../types';

export interface DemographicsProps {
  patient: Patient;
}

function DataItem({
  label,
  value,
  unit,
}: {
  label: string;
  value?: string | null | undefined;
  unit?: string | null | undefined;
}): JSX.Element {
  return (
    <span className="min-w-[220px]">
      <b>{label}: </b>
      {value === null || value === undefined ? '<NA>' : value + (unit ?? '')}
    </span>
  );
}

export default function Demographics({
  patient,
}: DemographicsProps): JSX.Element {
  return (
    <div className="flex gap-4 flex-wrap justify-between">
      <div className="flex flex-col gap-4">
        <DataItem label="ID" value={patient.patientId.toString()} />
        <DataItem label="Dataset" value={patient.campaign} />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem label="Age" value={patient.age} />
        <DataItem label="Sex" value={patient.sex} />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem label="Weight" value={patient.weight?.toString()} unit="kg" />
        <DataItem label="Height" value={patient.height?.toString()} unit="cm" />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem
          label="Is pregnent"
          value={patient.isPregnant ? 'Yes' : 'No'}
        />
        <DataItem
          label="Additional ID"
          value={patient.additionalId?.toString()}
        />
      </div>
    </div>
  );
}
