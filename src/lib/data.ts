import { parse } from '@vanillaes/csv';
import fs from 'fs/promises';
import {
  Auscultation,
  Location,
  Outcome,
  Patient,
  getGrading,
  getTiming,
} from '../types';

const DATA_DIR = 'dist/app/data/';

export let patients: Patient[] = [];

export async function readPatients(): Promise<void> {
  console.log('Reading patient index');
  const data = await fs.readFile(DATA_DIR + 'training_data.csv', {
    encoding: 'utf8',
  });

  const parsed = parse(data);
  parsed.shift(); // Remove the header row

  patients = parsed.map(row => ({
    patientId: parseInt(row[0], 10),
    locations: row[1].split('+'),
    age: row[2] === 'nan' ? null : row[2],
    sex: row[3],
    height: row[4] === 'nan' ? null : parseFloat(row[4]),
    weight: row[5] === 'nan' ? null : parseFloat(row[5]),
    isPregnant: row[6] === 'True',
    murmur: row[7],
    murmurLocations: row[8] === 'nan' ? [] : row[8].split('+'),
    mostAudible: row[9] === 'nan' ? null : row[9],
    systolicMurmur:
      row[10] === 'nan'
        ? null
        : {
            timing: getTiming(row[10]),
            shape: row[11],
            grading: getGrading(row[12]),
            pitch: row[13],
            quality: row[14],
          },
    diastolicMurmur:
      row[15] === 'nan'
        ? null
        : {
            timing: getTiming(row[15]),
            shape: row[16],
            grading: getGrading(row[17]),
            pitch: row[18],
            quality: row[19],
          },
    campaign: row[20],
    outcome: Outcome.Abnormal, // fixed below by reading patient files
    additionalId: row[21] === 'nan' ? null : parseInt(row[21], 10),
  }));

  console.log('Populating heart outcomes');

  await Promise.all(
    patients.map(async patient => {
      const data = await fs.readFile(
        DATA_DIR + `training_data/training_data/${patient.patientId}.txt`,
        {
          encoding: 'utf8',
        }
      );
      const lines = data.split(/\r?\n/);
      patient.outcome = lines
        .find(line => line.startsWith('#Outcome:'))
        ?.split(' ')[1] as Outcome;
    })
  );
}

export async function readAuscultation(
  patientId: number
): Promise<Auscultation> {
  const data = await fs.readFile(
    DATA_DIR + `training_data/training_data/${patientId}.txt`,
    {
      encoding: 'utf8',
    }
  );
  const lines = data.split(/\r?\n/);
  const auscultation: Auscultation = {
    patientId,
    tracks: [],
  };
  const trackCount = parseInt(lines[0].split(' ')[1], 10);
  for (let i = 1; i <= trackCount; i++) {
    const [location, headerFile, audioFile, segmentsFile] = lines[i].split(' ');
    const segments = await fs.readFile(
      DATA_DIR + `training_data/training_data/${segmentsFile}`,
      {
        encoding: 'utf8',
      }
    );
    const segmentLines = segments.split(/\r?\n/);
    auscultation.tracks.push({
      location: location as Location,
      headerFile,
      audioFile,
      segments: segmentLines
        .map(line => {
          const [start, end, type] = line.split(/\t/);
          return {
            start: parseFloat(start),
            end: parseFloat(end),
            type: parseInt(type, 10),
          };
        })
        .filter(s => !Number.isNaN(s.start)),
    });
  }
  return auscultation;
}
