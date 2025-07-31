import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuscultationTrack from './AuscultationTrack';

export interface FilterParams {
  tracks?: string[];
  names?: string[];
}

function filterToParams(filter: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.tracks) {
    filter.tracks.forEach(track => {
      params.append('t', track);
    });
  }
  if (filter.names) {
    filter.names.forEach(name => {
      params.append('n', name);
    });
  }
  return params;
}

function paramsToFilter(params: URLSearchParams): FilterParams {
  const newFilter: FilterParams = {};
  if (params.has('t')) {
    newFilter.tracks = params.getAll('t');
  }
  if (params.has('n')) {
    newFilter.names = params.getAll('n');
  }
  return newFilter;
}

export default function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterParams, setFilterParams] = useState<FilterParams>({});

  const [audioZoom, setAudioZoom] = useState(100);
  const [waveform, setWaveform] = useState(false);
  const [spectrogram, setSpectrogram] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filter = paramsToFilter(searchParams);
    setFilterParams(filter);
    if (nameRef.current) nameRef.current.value = '';
    if (urlRef.current) urlRef.current.value = '';
  }, [searchParams]);

  const loadAudio = () => {
    filterParams.names = filterParams.names ?? [];
    filterParams.tracks = filterParams.tracks ?? [];
    filterParams.names.push(nameRef.current?.value ?? '');
    filterParams.tracks.push(urlRef.current?.value ?? '');
    setSearchParams(filterToParams(filterParams));
  };

  return (
    <div className="p-8 flex flex-col gap-2">
      <Helmet>
        <title>Audio Analysis - auscultate</title>
      </Helmet>
      <div className="text-sm breadcrumbs flex justify-center w-full">
        <ul>
          <li>
            <a href="https://lysine-med.hf.space/">Med</a>
          </li>
          <li>
            <Link to="/">Auscultation</Link>
          </li>
          <li>Analysis</li>
        </ul>
      </div>
      <p className="text-3xl text-center">Audio Analysis</p>
      <p className="text-center">
        Load an audio file by URL for playback and analysis.
      </p>
      <div className="flex gap-2">
        <input
          ref={nameRef}
          type="text"
          className="input input-bordered w-full max-w-md flex-grow-0 flex-shrink"
          placeholder="Enter track name"
        ></input>
        <input
          ref={urlRef}
          type="text"
          className="input input-bordered w-full flex-1 min-w-[50%]"
          placeholder="Enter audio file URL"
        ></input>
      </div>
      <button className="btn btn-primary" onClick={loadAudio}>
        Load audio
      </button>
      <div className="divider"></div>
      <div className="flex gap-4 my-4 justify-end flex-wrap">
        <div className="form-control max-w-md">
          <label className="label cursor-pointer flex gap-4">
            <span className="label-text">Show waveform:</span>
            <input
              type="checkbox"
              className="toggle"
              checked={waveform}
              onChange={e => setWaveform(e.target.checked)}
            />
          </label>
        </div>
        <div className="form-control max-w-md">
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
      {filterParams.tracks?.map((track, index) => (
        <AuscultationTrack
          key={track}
          name={filterParams.names?.[index] ?? `Track ${index + 1}`}
          audioFile={track}
          zoom={audioZoom}
          waveform={waveform}
          spectrogram={spectrogram}
          onDelete={() => {
            const newTracks = [...(filterParams.tracks ?? [])];
            const newNames = [...(filterParams.names ?? [])];
            newTracks.splice(index, 1);
            newNames.splice(index, 1);
            setSearchParams(
              filterToParams({
                tracks: newTracks,
                names: newNames,
              })
            );
          }}
        />
      ))}
    </div>
  );
}
