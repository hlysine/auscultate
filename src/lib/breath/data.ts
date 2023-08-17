import { parse } from '@vanillaes/csv';
import fs from 'fs/promises';
import {
  AcquisitionMode,
  Location,
  Case,
  RecordingEquipment,
  Sex,
} from '../../breath-types';
import { captureAs, exactly, lineEnd, lineStart, match } from 'readable-regexp';

const DATA_DIR = 'dist/app/breath-data/';

const TRACK_NAME = match(
  lineStart,
  captureAs`patientId`.oneOrMore.digit,
  exactly`_`,
  captureAs`recordingId`.oneOrMore.word,
  exactly`_`,
  captureAs`location`.oneOrMore.charIn`a-zA-Z`,
  exactly`_`,
  captureAs`acquisitionMode`.oneOrMore.charIn`a-zA-Z`,
  exactly`_`,
  captureAs`equipment`.oneOrMore.word,
  exactly`.txt`,
  lineEnd
).toRegExp();

export const cases: Case[] = [];

export async function readCases(): Promise<void> {
  console.log('Breath sounds: Reading patient index');

  const files = await fs.readdir(
    DATA_DIR +
      'Respiratory_Sound_Database/Respiratory_Sound_Database/audio_and_txt_files'
  );
  const tracks = files.filter(file => file.endsWith('.txt'));

  const csv = await fs.readFile(
    DATA_DIR +
      'Respiratory_Sound_Database/Respiratory_Sound_Database/patient_diagnosis.csv',
    {
      encoding: 'utf8',
    }
  );
  const diagnoses = parse(csv);

  const data = await fs.readFile(DATA_DIR + 'demographic_info.txt', {
    encoding: 'utf8',
  });
  const lines = data.split(/\r?\n/).filter(line => line.trim().length > 0);

  const patients: Case[] = lines.map(row => {
    const cols = row.split(/\s/);
    return {
      patientId: parseInt(cols[0], 10),
      recordingId: '',
      caseId: cols[0],
      age: parseFloat(cols[1]),
      sex: cols[2] as Sex,
      bmi: cols[3] === 'NA' ? null : parseFloat(cols[3]),
      weight: cols[4] === 'NA' ? null : parseFloat(cols[4]),
      height: cols[5] === 'NA' ? null : parseFloat(cols[5]),
      diagnosis: diagnoses.find(d => d[0] === cols[0])![1],
      tracks: [],
    };
  });

  console.log('Breath sounds: Populating sound tracks');

  await Promise.all(
    patients.map(async patient => {
      await Promise.all(
        tracks
          .filter(track => track.startsWith(patient.patientId.toString() + '_'))
          .map(async track => {
            const props = TRACK_NAME.exec(track)!.groups!;
            const segmentData = await fs.readFile(
              DATA_DIR +
                'Respiratory_Sound_Database/Respiratory_Sound_Database/audio_and_txt_files/' +
                track,
              {
                encoding: 'utf8',
              }
            );
            const segments = segmentData
              .split(/\r?\n/)
              .filter(line => line.trim().length > 0)
              .map(line => {
                const cols = line.split(/[\s\t]+/);
                return {
                  start: parseFloat(cols[0]),
                  end: parseFloat(cols[1]),
                  crackles: cols[2] !== '0',
                  wheezes: cols[3] !== '0',
                };
              });
            patient.tracks.push({
              recordingId: props.recordingId,
              audioFile: track.replace(/\.txt$/, '.wav'),
              location: props.location as Location,
              acquisitionMode: props.acquisitionMode as AcquisitionMode,
              recordingEquipment: props.equipment as RecordingEquipment,
              segments,
            });
          })
      );
    })
  );

  console.log('Breath sounds: Splitting patients into cases');

  // Split each patient into multiple patients by the recording id in their tracks
  // If multiple tracks from the same patient has the same recording id, keep them in the same patient
  const caseMap = new Map<string, Case>();
  patients.forEach(patient => {
    patient.tracks.forEach(track => {
      const patientId = `${patient.patientId}_${track.recordingId}`;
      if (caseMap.has(patientId)) {
        caseMap.get(patientId)!.tracks.push(track);
      } else {
        caseMap.set(patientId, {
          ...patient,
          recordingId: track.recordingId,
          tracks: [track],
        });
      }
    });
  });
  cases.push(...caseMap.values());
}
