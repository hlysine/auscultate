import React from 'react';
import { Case, nameSex } from '../../breath-types';
import DataItem from '../DataItem';

export interface DemographicsProps {
  _case: Case;
}

export default function Demographics({
  _case,
}: DemographicsProps): JSX.Element {
  return (
    <div className="flex gap-4 flex-wrap justify-between">
      <div className="flex flex-col gap-4">
        <DataItem label="Patient ID" value={_case.patientId.toString()} />
        <DataItem label="Recording ID" value={_case.recordingId.toString()} />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem
          label="Age"
          value={
            _case.age < 1
              ? `${Math.round(_case.age * 12)} months`
              : _case.age.toString()
          }
        />
        <DataItem label="Sex" value={nameSex(_case.sex)} />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem label="Weight" value={_case.weight?.toString()} unit="kg" />
        <DataItem label="Height" value={_case.height?.toString()} unit="cm" />
      </div>
      <div className="flex flex-col gap-4">
        <DataItem label="BMI" value={_case.bmi?.toString()} />
      </div>
    </div>
  );
}
