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
  nameLocation,
  nameMurmur,
  nameTiming,
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

  const arrayToggle = <T extends string>(
    array: Exclude<keyof FilterParams, 'murmur'>,
    value: T,
    checked: boolean
  ): void => {
    setFilterParams(f => {
      if (checked) {
        return {
          ...f,
          [array]: [...(f[array] ?? []), value],
        };
      } else {
        return {
          ...f,
          [array]: (f[array] as string[] | null)?.filter(v => v !== value),
        };
      }
    });
  };

  return (
    <div className="p-8 flex flex-col gap-2">
      <p className="text-3xl">Auscultation Database</p>
      <p>
        Filter and access auscultation sound tracks from the CirCor DigiScope
        Phonocardiogram Dataset.
      </p>
      <div className="bg-base-200 p-4">
        <div className="divider">Auscultation location</div>
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.values(Location).map(loc => (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={filterParams.location?.includes(loc)}
                  onChange={e => arrayToggle('location', loc, e.target.checked)}
                  className="checkbox"
                />
                <span className="label-text">{nameLocation(loc)}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="divider">Murmur Type</div>
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="form-control">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                className="radio"
                checked={!filterParams.murmur}
                onChange={e => {
                  if (e.target.checked) {
                    setFilterParams(f => ({ ...f, murmur: undefined }));
                  }
                }}
              />
              <span className="label-text">No filter</span>
            </label>
          </div>
          {Object.values(MurmurFilter).map(filter => (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  className="radio"
                  checked={filterParams.murmur === filter}
                  onChange={e => {
                    if (e.target.checked) {
                      setFilterParams(f => ({ ...f, murmur: filter }));
                    }
                  }}
                />
                <span className="label-text">{nameMurmur(filter)}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="divider">Murmur location</div>
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.values(Location).map(loc => (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={filterParams.murmurLocation?.includes(loc)}
                  onChange={e =>
                    arrayToggle('murmurLocation', loc, e.target.checked)
                  }
                  className="checkbox"
                />
                <span className="label-text">{nameLocation(loc)}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="divider">Murmur Timing</div>
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.values(MurmurTiming).map(loc => (
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={filterParams.timing?.includes(loc)}
                  onChange={e => arrayToggle('timing', loc, e.target.checked)}
                  className="checkbox"
                />
                <span className="label-text">
                  {nameTiming(
                    loc,
                    ['systolic', 'diastolic'].includes(
                      filterParams.murmur ?? ''
                    )
                      ? (filterParams.murmur as 'systolic' | 'diastolic')
                      : 'general'
                  )}
                </span>
              </label>
            </div>
          ))}
        </div>

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
