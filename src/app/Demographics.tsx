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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 justify-between">
        <DataItem label="ID" value={patient.patientId.toString()} />
        <DataItem label="Age" value={patient.age} />
        <DataItem label="Height" value={patient.height?.toString()} unit="cm" />
        <DataItem
          label="Is pregnent"
          value={patient.isPregnant ? 'Yes' : 'No'}
        />
      </div>
      <div className="flex flex-wrap gap-4 justify-between">
        <DataItem label="Dataset" value={patient.campaign} />
        <DataItem label="Sex" value={patient.sex} />
        <DataItem label="Weight" value={patient.weight?.toString()} unit="kg" />
        <DataItem
          label="Additional ID"
          value={patient.additionalId?.toString()}
        />
      </div>
    </div>
  );
}
