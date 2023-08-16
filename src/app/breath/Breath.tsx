import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getCase, getRandomCase } from './api';
import Demographics from './Demographics';
import AuscultationTrack, { RegionsLevel } from './AuscultationTrack';
import {
  Abnormalities,
  Diagnosis,
  FilterParams,
  Location,
  Case,
  SoundFilter,
  getTrackAbnormalities,
  nameDiagnosis,
  nameLocation,
  nameSoundFilter,
} from '../../breath-types';

function filterToParams(filter: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.location) {
    filter.location.forEach(loc => params.append('location', loc));
  }
  if (filter.abnormalLocation) {
    filter.abnormalLocation.forEach(loc =>
      params.append('abnormalLocation', loc)
    );
  }
  if (filter.sound) {
    params.set('sound', filter.sound);
  }
  if (filter.diagnosis) {
    filter.diagnosis.forEach(d => params.append('diagnosis', d));
  }
  return params;
}

function paramsToFilter(params: URLSearchParams): FilterParams {
  const newFilter: FilterParams = {};
  if (params.has('location')) {
    newFilter.location = params.getAll('location') as Location[];
  }
  if (params.has('abnormalLocation')) {
    newFilter.abnormalLocation = params.getAll(
      'abnormalLocation'
    ) as Location[];
  }
  if (params.has('sound')) {
    newFilter.sound = params.get('sound') as SoundFilter;
  }
  if (params.has('diagnosis')) {
    newFilter.diagnosis = params.getAll('diagnosis') as Diagnosis[];
  }
  return newFilter;
}

function getTrackDescription(
  abnormalities: Abnormalities,
  location: Location
): ReactNode {
  if (!abnormalities.crackles && !abnormalities.wheezes) return null;
  return (
    <p className="text-lg" key={location}>
      {(() => {
        if (abnormalities.crackles && abnormalities.wheezes) {
          return (
            <>
              <kbd className="kbd">Crackles</kbd> and{' '}
              <kbd className="kbd">wheezes</kbd>
            </>
          );
        } else if (abnormalities.crackles) {
          return <kbd className="kbd">Crackles</kbd>;
        } else if (abnormalities.wheezes) {
          return <kbd className="kbd">Wheezes</kbd>;
        } else {
          return 'Normal breath sounds';
        }
      })()}
      {' at '}
      <kbd className="kbd">{nameLocation(location)}</kbd>
    </p>
  );
}

export default function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const [caseId, setCaseId] = useState<{
    patientId: number;
    recordingId: string;
  } | null>(null);
  const [resultCount, setResultCount] = useState<number>(-1);

  const [filterParams, setFilterParams] = useState<FilterParams>({});

  const [_case, setCase] = useState<Case | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [audioZoom, setAudioZoom] = useState(100);
  const [regionsLevel, setRegionsLevel] = useState<RegionsLevel>(
    RegionsLevel.None
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [spectrogram, setSpectrogram] = useState(false);

  const getRandom = (filterParams: FilterParams) => {
    setLoading(true);
    getRandomCase(filterParams)
      .then(result => {
        setCaseId({
          patientId: result.patientId,
          recordingId: result.recordingId,
        });
        setResultCount(result.count);
        setSearchParams(p => {
          p.set('id', result.patientId.toString() + '_' + result.recordingId);
          return p;
        });
      })
      .catch(err => {
        if (err.response.status === 404) {
          setResultCount(0);
          setCase(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadCase = () => {
    setLoading(true);
    getCase(caseId!.patientId, caseId!.recordingId)
      .then(_case => {
        setCase(_case);
        setError(null);
      })
      .catch(err => {
        setCase(null);
        setError(err.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setShowAnswer(false);
    const filterParams = paramsToFilter(searchParams);
    setFilterParams(filterParams);
    if (caseId === null) {
      if (searchParams.has('id')) {
        const id = searchParams.get('id')!.split('_');
        setCaseId({
          patientId: Number(id[0]),
          recordingId: id[1],
        });
      } else {
        getRandom(filterParams);
      }
    } else {
      loadCase();
    }
  }, [searchParams, caseId]);

  const randomClicked = () => {
    setSearchParams(filterToParams(filterParams));
    setCaseId(null);
  };

  const arrayToggle = <T extends string>(
    array: Exclude<keyof FilterParams, 'sound'>,
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
      <Helmet>
        <title>Breath Sounds Database - auscultate</title>
      </Helmet>
      <div className="text-sm breadcrumbs flex justify-center w-full">
        <ul>
          <li>
            <a href="https://lysine-med.hf.space/">Med</a>
          </li>
          <li>
            <Link to="/">Auscultation</Link>
          </li>
          <li>Breath Sounds</li>
        </ul>
      </div>
      <p className="text-3xl text-center">Breath Sounds Database</p>
      <p className="text-center">
        Filter and access breath sounds from the Respiratory Sound Database.
      </p>
      <p className="font-bold">Points to note</p>
      <ul className="list-disc">
        <li>
          The provided analysis may not be 100% accurate and may not be the only
          abnormalities found.
        </li>
        <li>
          This dataset only records crackles and wheezes. Other abnormal breath
          sounds are not considered.
        </li>
      </ul>
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

              <div className="divider">Breath Sound Type</div>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <input
                      type="radio"
                      className="radio"
                      checked={!filterParams.sound}
                      onChange={e => {
                        if (e.target.checked) {
                          setFilterParams(f => ({ ...f, sound: undefined }));
                        }
                      }}
                    />
                    <span className="label-text">No filter</span>
                  </label>
                </div>
                {Object.values(SoundFilter).map(filter => (
                  <div key={filter} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="radio"
                        className="radio"
                        checked={filterParams.sound === filter}
                        onChange={e => {
                          if (e.target.checked) {
                            setFilterParams(f => ({ ...f, sound: filter }));
                          }
                        }}
                      />
                      <span className="label-text">
                        {nameSoundFilter(filter)}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="divider">Abnormal sound location</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(Location).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={
                          filterParams.abnormalLocation?.includes(loc) ?? false
                        }
                        onChange={e =>
                          arrayToggle('abnormalLocation', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">{nameLocation(loc)}</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="divider">Diagnosis</div>
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.values(Diagnosis).map(loc => (
                  <div key={loc} className="form-control">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        checked={filterParams.diagnosis?.includes(loc) ?? false}
                        onChange={e =>
                          arrayToggle('diagnosis', loc, e.target.checked)
                        }
                        className="checkbox"
                      />
                      <span className="label-text">{nameDiagnosis(loc)}</span>
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
            'Random Case'
          )}
        </button>
      </div>
      {resultCount < 0 ? null : (
        <p>{resultCount} cases with the selected filters.</p>
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
              An error occurred while loading the case
            </h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}
      <div className="divider"></div>
      {_case === null ? null : (
        <div>
          <Demographics _case={_case} />
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
          {_case.tracks.map(track => (
            <AuscultationTrack
              key={track.audioFile}
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
              Breath Sound Analysis
            </div>
            <div className="collapse-content">
              <div className="p-4 pt-0 flex flex-col items-center w-full gap-4">
                {(() => {
                  const descriptions = _case.tracks
                    .map(track =>
                      getTrackDescription(
                        getTrackAbnormalities(track),
                        track.location
                      )
                    )
                    .filter(Boolean);
                  if (descriptions.length === 0) {
                    return <p className="text-lg">No crackles and wheezes</p>;
                  } else {
                    return descriptions;
                  }
                })()}
                <p className="text-lg">
                  Diagnosis: {nameDiagnosis(_case.diagnosis)}
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
