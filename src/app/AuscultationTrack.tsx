import React, { useEffect, useRef } from 'react';
import { AuscultationTrack, FullPatient, nameLocation } from '../types';
import WaveSurfer from 'wavesurfer.js';
import { getDataUrl } from './api';

export interface AuscultationTrackProps {
  patient: FullPatient;
  track: AuscultationTrack;
}

export default function AuscultationTrack({
  patient,
  track,
}: AuscultationTrackProps): JSX.Element {
  const waveformId = ('waveform' + track.audioFile).replaceAll('.', '_');

  const wavesurfer = useRef<WaveSurfer>();
  useEffect(() => {
    const instance = WaveSurfer.create({
      container: '#' + waveformId,
      url: getDataUrl(track.audioFile),
    });
    wavesurfer.current = instance;
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <div className="flex gap-4 m-4">
      <div className="flex flex-col w-32">
        <span className="text-xl text-center flex-1">
          {nameLocation(track.location)}
        </span>
        <button className="btn" onClick={() => wavesurfer.current?.playPause()}>
          {wavesurfer.current?.isPlaying() ? 'Pause' : 'Play'}
        </button>
      </div>
      <div id={waveformId} className="flex-1"></div>
    </div>
  );
}
