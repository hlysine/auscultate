import React, { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FilterParams,
  FullPatient,
  Location,
  Murmur,
  MurmurFilter,
  MurmurGrading,
  MurmurPitch,
  MurmurQuality,
  MurmurShape,
  MurmurStatus,
  MurmurTiming,
  nameGrading,
  nameLocation,
  nameMurmur,
  nameTiming,
} from '../types';
import { getPatient, getRandomPatient } from './api';
import Demographics from './Demographics';
import AuscultationTrack, { RegionsLevel } from './AuscultationTrack';

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

function getSingleMurmurDescription(
  murmur: Murmur,
  type: 'systolic' | 'diastolic',
  capitalize: boolean
): ReactNode {
  return (
    <>
      {capitalize ? 'A' : 'a'}{' '}
      <kbd className="kbd">{murmur.pitch.toLocaleLowerCase()}-pitched</kbd>{' '}
      <kbd className="kbd">
        {nameTiming(murmur.timing, type).toLocaleLowerCase()}
      </kbd>{' '}
      <kbd className="kbd">{murmur.quality.toLocaleLowerCase()}</kbd> murmur of
      grade <kbd className="kbd">{nameGrading(murmur.grading, type)}</kbd>
    </>
  );
}

function getMurmurDescription(patient: FullPatient): ReactNode {
  if (patient.murmur === MurmurStatus.Unknown) {
    return 'Murmur status unknown.';
  } else if (patient.systolicMurmur && patient.diastolicMurmur) {
    const systolic = getSingleMurmurDescription(
      patient.systolicMurmur,
      'systolic',
      true
    );
    const diastolic = getSingleMurmurDescription(
      patient.diastolicMurmur,
      'diastolic',
      false
    );
    return (
      <>
        {systolic} and <br />
        {diastolic}
        {patient.mostAudible ? (
          <>
            , best heard at{' '}
            <kbd className="kbd">
              {nameLocation(patient.mostAudible).toLocaleLowerCase()}
            </kbd>
          </>
        ) : null}
        .
      </>
    );
  } else if (patient.systolicMurmur) {
    return (
      <>
        {getSingleMurmurDescription(patient.systolicMurmur, 'systolic', true)}
        {patient.mostAudible ? (
          <>
            , best heard at{' '}
            <kbd className="kbd">
              {nameLocation(patient.mostAudible).toLocaleLowerCase()}
            </kbd>
          </>
        ) : null}
        .
      </>
    );
  } else if (patient.diastolicMurmur) {
    return (
      <>
        {getSingleMurmurDescription(patient.diastolicMurmur, 'diastolic', true)}
        {patient.mostAudible ? (
          <>
            , best heard at{' '}
            <kbd className="kbd">
              {nameLocation(patient.mostAudible).toLocaleLowerCase()}
            </kbd>
          </>
        ) : null}
        .
      </>
    );
  } else {
    return 'No murmur detected.';
  }
}

export default function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [resultCount, setResultCount] = useState<number>(-1);

  const [filterParams, setFilterParams] = useState<FilterParams>({});

  const [patient, setPatient] = useState<FullPatient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [audioZoom, setAudioZoom] = useState(100);
  const [regionsLevel, setRegionsLevel] = useState<RegionsLevel>(
    RegionsLevel.None
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [spectrogram, setSpectrogram] = useState(false);

  const getRandom = () => {
    setLoading(true);
    getRandomPatient(filterParams)
      .then(result => {
        setPatientId(result.patientId);
        setResultCount(result.count);
        setSearchParams(p => {
          p.set('id', result.patientId.toString());
          return p;
        });
      })
      .catch(err => {
        if (err.response.status === 404) {
          setResultCount(0);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadPatient = () => {
    setLoading(true);
    getPatient(patientId!)
      .then(patient => {
        setPatient(patient);
        setError(null);
      })
      .catch(err => {
        setPatient(null);
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setShowAnswer(false);
    setFilterParams(paramsToFilter(searchParams));
    if (patientId === null) {
      if (searchParams.has('id')) {
        setPatientId(Number(searchParams.get('id')));
      } else {
        getRandom();
      }
    } else {
      loadPatient();
    }
  }, [searchParams, patientId]);

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
      <p className="text-3xl text-center">Auscultation Database</p>
      <p className="text-center">
        Filter and access auscultation sound tracks from the CirCor DigiScope
        Phonocardiogram Dataset.
      </p>
      <div className="collapse collapse-arrow bg-base-200 my-4">
        <input type="checkbox" />
        <div className="collapse-title text-xl font-medium">Select Filters</div>
        <div className="collapse-content">
          <form className="bg-base-200 p-4 pt-0 flex flex-col items-center w-full">
            <fieldset className="w-full" disabled={loading}>
              <div className="divider">Auscultation location</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(Location).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.location?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('location', loc, e.target.checked)
                        }
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
                  <div key={filter} className="form-control">
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
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={
                          filterParams.murmurLocation?.includes(loc) ?? false
                        }
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
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.timing?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('timing', loc, e.target.checked)
                        }
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

              <div className="divider">Murmur Shape</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(MurmurShape).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.shape?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('shape', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">{loc}</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="divider">Murmur Grading</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(MurmurGrading).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.grading?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('grading', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">
                        {nameGrading(
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

              <div className="divider">Murmur Pitch</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(MurmurPitch).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.pitch?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('pitch', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">{loc}</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="divider">Murmur Quality</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(MurmurQuality).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.quality?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('quality', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">{loc}</span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </form>
        </div>

        <button
          className="btn btn-primary"
          onClick={randomClicked}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Random Patient'
          )}
        </button>
      </div>
      {resultCount < 0 ? null : (
        <p>{resultCount} patients with the selected filters.</p>
      )}
      {error === null ? null : (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">
              An error occurred while loading the patient
            </h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}
      <div className="divider"></div>
      {patient === null ? null : (
        <div>
          <Demographics patient={patient} />
          <div className="flex gap-4 my-4 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span>Zoom: </span>
              <input
                type="range"
                min="20"
                max="1000"
                value={audioZoom}
                onChange={e => setAudioZoom(Number(e.target.value))}
                className="range range-sm min-w-[250px] w-1/4"
              />
            </div>
          </div>
          {patient.tracks.map(track => (
            <AuscultationTrack
              key={track.audioFile}
              patient={patient}
              track={track}
              zoom={audioZoom}
              showAnswer={showAnswer}
              spectrogram={showAnswer && spectrogram}
              regionsLevel={showAnswer ? regionsLevel : RegionsLevel.None}
            />
          ))}
          <div className="collapse collapse-arrow bg-base-200">
            <input
              type="checkbox"
              checked={showAnswer}
              onChange={e => setShowAnswer(e.target.checked)}
            />
            <div className="collapse-title text-xl font-medium">
              Heart Sound Analysis
            </div>
            <div className="collapse-content">
              <div className="p-4 pt-0 flex flex-col items-center w-full gap-4">
                <p className="text-lg">{getMurmurDescription(patient)}</p>
                <p>
                  All audible locations:{' '}
                  {patient.murmurLocations.map(loc => (
                    <kbd className="kbd" key={loc}>
                      {nameLocation(loc)}
                    </kbd>
                  ))}
                </p>
                <div className="flex gap-8 my-4 justify-end flex-wrap">
                  <div className="flex items-center gap-4">
                    <span className="label-text">Annotations:</span>
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={regionsLevel}
                        onChange={e => setRegionsLevel(Number(e.target.value))}
                        className="range"
                        step="1"
                      />
                      <div className="w-full flex justify-between text-[5px] px-2">
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                        <span>|</span>
                      </div>
                    </div>
                  </div>
                  <div className="divider-vertical" />
                  <div className="form-control">
                    <label className="label cursor-pointer flex gap-4">
                      <span className="label-text">Show spectrogram:</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={spectrogram}
                        onChange={e => setSpectrogram(e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
