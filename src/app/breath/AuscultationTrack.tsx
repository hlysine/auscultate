import React, { useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import HoverPlugin from 'wavesurfer.js/plugins/hover';
import TimelinePlugin from 'wavesurfer.js/plugins/timeline';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';
import SpectrogramPlugin from 'wavesurfer.js/plugins/spectrogram';
import { getDataUrl } from './api';
import { useAudio } from '../AudioContext';
import {
  AuscultationTrack,
  SoundSegment,
  nameLocation,
  getTrackAbnormalities,
  Abnormalities,
} from '../../breath-types';

export interface AuscultationTrackProps {
  track: AuscultationTrack;
  zoom: number;
  showAnswer: boolean;
  spectrogram: boolean;
  regionsLevel: RegionsLevel;
}

export enum RegionsLevel {
  None = 0,
  Markers = 1,
  Noises = 2,
  Full = 3,
}

function getColorByType(segment: SoundSegment | Abnormalities): string {
  if (segment.crackles && segment.wheezes) {
    return '#36d39933';
  } else if (segment.crackles) {
    return '#3abff833';
  } else if (segment.wheezes) {
    return '#fbbd2333';
  } else {
    return '#f8727233';
  }
}

function nameSegment(segment: SoundSegment | Abnormalities): string {
  if (segment.crackles && segment.wheezes) {
    return 'Both';
  } else if (segment.crackles) {
    return 'Crackles';
  } else if (segment.wheezes) {
    return 'Wheezes';
  } else {
    return '';
  }
}

export default function AuscultationTrackComponent({
  track,
  zoom,
  showAnswer,
  spectrogram: showSpectrogram,
  regionsLevel,
}: AuscultationTrackProps): JSX.Element {
  const waveformId = ('waveform' + track.audioFile).replaceAll('.', '_');

  const { nowPlaying, setNowPlaying } = useAudio();

  const wavesurfer = useRef<WaveSurfer>();
  const regions = useRef<any>();
  const activeRegion = useRef<any>();
  useEffect(() => {
    if (showSpectrogram) {
      const spectrogramPlugin = SpectrogramPlugin.create({
        labels: true,
        height: 100,
      });
      wavesurfer.current?.registerPlugin(spectrogramPlugin);
      spectrogramPlugin.render();
      return () => {
        spectrogramPlugin.destroy();
      };
    }
    return undefined;
  }, [showSpectrogram]);
  useEffect(() => {
    regions.current?.clearRegions();
    if (regionsLevel === RegionsLevel.Full) {
      track.segments.forEach(segment => {
        regions.current?.addRegion({
          start: segment.start,
          end: segment.end,
          color: getColorByType(segment),
          content: nameSegment(segment),
          drag: false,
          resize: false,
        });
      });
    } else if (regionsLevel === RegionsLevel.Noises) {
      track.segments.forEach(segment => {
        regions.current?.addRegion({
          start: segment.start,
          end: segment.crackles || segment.wheezes ? segment.end : undefined,
          color: getColorByType(segment),
          content: nameSegment(segment),
          drag: false,
          resize: false,
        });
      });
    } else if (regionsLevel === RegionsLevel.Markers) {
      track.segments.forEach(segment => {
        regions.current?.addRegion({
          start: segment.start,
          color: getColorByType(segment),
          content: nameSegment(segment),
          drag: false,
          resize: false,
        });
      });
    }
  }, [regionsLevel]);
  useEffect(() => {
    const instance = WaveSurfer.create({
      container: '#' + waveformId,
      url: getDataUrl(track.audioFile),
      minPxPerSec: zoom,
      plugins: [
        HoverPlugin.create(),
        TimelinePlugin.create(),
        (regions.current = RegionsPlugin.create()),
      ],
    });
    regions.current.on('region-clicked', (region: any, e: MouseEvent) => {
      e.stopPropagation(); // prevent triggering a click on the waveform
      activeRegion.current = region;
      region.play();
    });
    regions.current.on('region-out', (region: any) => {
      if (activeRegion.current === region) {
        activeRegion.current = undefined;
        instance.pause();
      }
    });
    instance.on('play', () => {
      setNowPlaying(waveformId);
    });
    instance.on('pause', () => {
      setNowPlaying(v => v); // just to trigger a rerender
    });
    wavesurfer.current = instance;
    return () => {
      try {
        instance.destroy();
      } catch (e) {
        console.log(e); // an error may be thrown because the spectrogram plugin is destroyed twice
      }
      wavesurfer.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (nowPlaying !== waveformId) {
      wavesurfer.current?.pause();
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (wavesurfer.current?.getDecodedData()) wavesurfer.current?.zoom(zoom);
  }, [zoom]);

  const abnormalities = useMemo(() => getTrackAbnormalities(track), [track]);

  return (
    <div className="flex gap-4 my-8 flex-wrap justify-center">
      <div className="flex flex-col w-48 gap-4 my-4">
        <span className="text-xl text-center flex-1">
          {nameLocation(track.location)}
        </span>

        <span
          className="text-lg text-center text-warning"
          style={{
            visibility:
              showAnswer && (abnormalities.crackles || abnormalities.wheezes)
                ? 'visible'
                : 'hidden',
          }}
        >
          {nameSegment(abnormalities)}
        </span>

        <div className="flex gap-2">
          <button
            className="btn btn-accent flex-grow-[2]"
            onClick={async () => {
              await wavesurfer.current?.playPause();
              setNowPlaying(waveformId);
            }}
          >
            <svg width="24px" height="24px" viewBox="0 0 24 24">
              <path
                d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button
            className="btn flex-grow-[1]"
            onClick={async () => {
              await wavesurfer.current?.stop();
              setNowPlaying(v => (v === waveformId ? null : v));
            }}
          >
            <svg width="24px" height="24px" viewBox="0 0 32 32">
              <path
                d="M5.92 24.096q0 0.832 0.576 1.408t1.44 0.608h16.128q0.832 0 1.44-0.608t0.576-1.408v-16.16q0-0.832-0.576-1.44t-1.44-0.576h-16.128q-0.832 0-1.44 0.576t-0.576 1.44v16.16z"
                fill="#a6adba"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div id={waveformId} className="waveform flex-1 min-w-[250px]"></div>
    </div>
  );
}
