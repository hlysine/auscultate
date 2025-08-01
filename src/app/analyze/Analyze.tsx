import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuscultationTrack from './AuscultationTrack';
import { compress, decompress } from './compressor';

export interface Track {
  name: string;
  audioFile: string;
}

export interface FilterParams {
  tracks?: Track[];
  description?: string;
}

export interface CompressedParams {
  t?: [string, string][];
  d?: string;
}

async function filterToParams(filter: FilterParams): Promise<URLSearchParams> {
  const params = new URLSearchParams();
  if (filter.tracks || filter.description) {
    const compressed: CompressedParams = {
      t: filter.tracks?.map(track => [track.name, track.audioFile]),
      d: filter.description,
    };
    params.set('d', await compress(JSON.stringify(compressed)));
  }
  return params;
}

async function paramsToFilter(params: URLSearchParams): Promise<FilterParams> {
  const newFilter: FilterParams = {};
  if (params.has('d')) {
    const compressed = JSON.parse(
      await decompress(params.get('d')!)
    ) as CompressedParams;
    if (compressed.t) {
      newFilter.tracks = compressed.t.map(([name, audioFile]) => ({
        name,
        audioFile,
      }));
    }
    if (compressed.d) {
      newFilter.description = compressed.d;
    }
  }
  return newFilter;
}

export default function App(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterParams, setFilterParams] = useState<FilterParams>({});

  const [audioZoom, setAudioZoom] = useState(100);
  const [waveform, setWaveform] = useState(false);
  const [spectrogram, setSpectrogram] = useState(false);

  const descriptionRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [enableEdit, setEnableEdit] = useState(false);

  useEffect(() => {
    (async () => {
      const filter = await paramsToFilter(searchParams);
      setFilterParams(filter);
      if (descriptionRef.current)
        descriptionRef.current.value = filter.description ?? '';
      if (nameRef.current) nameRef.current.value = '';
      if (urlRef.current) urlRef.current.value = '';
      if (!filter.tracks && !filter.description) {
        setEnableEdit(true);
      }
    })();
  }, [searchParams]);

  const loadAudio = async () => {
    if (nameRef.current === null || urlRef.current === null) return;
    if (nameRef.current.value === '' || urlRef.current.value === '') return;
    filterParams.tracks = filterParams.tracks ?? [];
    filterParams.tracks.push({
      name: nameRef.current?.value ?? '',
      audioFile: urlRef.current?.value ?? '',
    });
    setSearchParams(await filterToParams(filterParams));
  };

  const updateDescription = async () => {
    filterParams.description = descriptionRef.current?.value ?? '';
    setSearchParams(await filterToParams(filterParams));
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
        Load a case by URL for playback and analysis.
      </p>
      {enableEdit && (
        <>
          <input
            ref={descriptionRef}
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter description"
          ></input>
          <button
            className="btn btn-primary btn-outline"
            onClick={updateDescription}
          >
            Update description
          </button>
          <div className="flex gap-2 mt-4">
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
          <button className="btn btn-primary btn-outline" onClick={loadAudio}>
            Add audio
          </button>
        </>
      )}
      <div className="divider"></div>
      <div className="flex justify-between flex-wrap gap-4 items-end">
        <p className="py-2 px-1">{filterParams.description}</p>
        <div className="flex gap-4 justify-end flex-wrap">
          <div className="form-control max-w-md">
            <label className="label cursor-pointer flex gap-4">
              <span className="label-text">Edit case:</span>
              <input
                type="checkbox"
                className="toggle"
                checked={enableEdit}
                onChange={e => setEnableEdit(e.target.checked)}
              />
            </label>
          </div>
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
      </div>
      {filterParams.tracks?.map(track => (
        <AuscultationTrack
          key={track.audioFile}
          name={track.name}
          audioFile={track.audioFile}
          zoom={audioZoom}
          waveform={waveform}
          spectrogram={spectrogram}
          editable={enableEdit}
          onDelete={async () => {
            const newTracks = filterParams.tracks?.filter(t => t !== track);
            setSearchParams(
              await filterToParams({ ...filterParams, tracks: newTracks })
            );
          }}
        />
      ))}
    </div>
  );
}
