import React from 'react';

export default function DataItem({
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
