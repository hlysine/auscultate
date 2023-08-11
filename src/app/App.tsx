import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FilterParams,
  FullPatient,
  Location,
  MurmurFilter,
  MurmurGrading,
  MurmurPitch,
  MurmurQuality,
  MurmurShape,
  MurmurTiming,
} from '../types';
import { getPatient, getRandomPatient } from './api';

function filterToParams(filter: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.location) {
    filter.location.forEach(loc => params.append('location', loc));
  }
  if (filter.murmur) {
    params.set('murmur', filter.murmur);
  }
  if (filter.murmurLocation) {
    filter.murmurLocation.forEach(loc => params.append('murmurLocation', loc));
  }
  if (filter.mostAudible) {
    filter.mostAudible.forEach(loc => params.append('mostAudible', loc));
  }
  if (filter.timing) {
    filter.timing.forEach(timing => params.append('timing', timing));
  }
  if (filter.shape) {
    filter.shape.forEach(shape => params.append('shape', shape));
  }
  if (filter.grading) {
    filter.grading.forEach(grading => params.append('grading', grading));
  }
  if (filter.pitch) {
    filter.pitch.forEach(pitch => params.append('pitch', pitch));
  }
  if (filter.quality) {
    filter.quality.forEach(quality => params.append('quality', quality));
  }
  return params;
}

function paramsToFilter(params: URLSearchParams): FilterParams {
  const newFilter: FilterParams = {};
  if (params.has('location')) {
    newFilter.location = params.getAll('location') as Location[];
  }
  if (params.has('murmur')) {
    newFilter.murmur = params.get('murmur') as MurmurFilter;
  }
  if (params.has('murmurLocation')) {
    newFilter.murmurLocation = params.getAll('murmurLocation') as Location[];
  }
  if (params.has('mostAudible')) {
    newFilter.mostAudible = params.getAll('mostAudible') as Location[];
  }
  if (params.has('timing')) {
    newFilter.timing = params.getAll('timing') as MurmurTiming[];
  }
  if (params.has('shape')) {
    newFilter.shape = params.getAll('shape') as MurmurShape[];
  }
  if (params.has('grading')) {
    newFilter.grading = params.getAll('grading') as MurmurGrading[];
  }
  if (params.has('pitch')) {
    newFilter.pitch = params.getAll('pitch') as MurmurPitch[];
  }
  if (params.has('quality')) {
    newFilter.quality = params.getAll('quality') as MurmurQuality[];
  }
  return newFilter;
}

function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState<number>(0);

  const [filterParams, setFilterParams] = useState<FilterParams>({});

  const [patient, setPatient] = useState<FullPatient | null>(null);

  useEffect(() => {
    if (searchParams.has('id')) {
      setPatientId(Number(searchParams.get('id')));
    }
    setFilterParams(paramsToFilter(searchParams));
  }, [searchParams]);

  const getRandom = () => {
    getRandomPatient(filterParams).then(result => {
      setPatientId(result.patientId);
      setResultCount(result.count);
      setSearchParams(p => {
        p.set('id', result.patientId.toString());
        return p;
      });
    });
  };

  const loadPatient = () => {
    getPatient(patientId!).then(patient => {
      setPatient(patient);
    });
  };

  useEffect(() => {
    if (patientId === null) {
      getRandom();
    } else {
      loadPatient();
    }
  }, [patientId]);

  const randomClicked = () => {
    setSearchParams(filterToParams(filterParams));
    setPatientId(null);
  };

  return (
    <div className="p-8 flex flex-col gap-2">
      <p className="text-3xl">Auscultation Database</p>
      <p>
        Filter and access auscultation sound tracks from the CirCor DigiScope
        Phonocardiogram Dataset.
      </p>
      <div className="bg-base-200 p-4">
        <button className="btn btn-primary" onClick={randomClicked}>
          Random Patient
        </button>
      </div>
      <p>{resultCount} patients with the selected filters.</p>
      <p>{JSON.stringify(patient, undefined, 2)}</p>
    </div>
  );
}

export default App;
