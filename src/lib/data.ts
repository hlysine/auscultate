import { parse } from '@vanillaes/csv';
import fs from 'fs/promises';
import { Patient, getTiming } from '../types';

const DATA_DIR = 'dist/app/data/';

export let patients: Patient[] = [];

export async function readPatients(): Promise<void> {
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
            grading: row[12],
            pitch: row[13],
            quality: row[14],
          },
    diastolicMurmur:
      row[15] === 'nan'
        ? null
        : {
            timing: getTiming(row[15]),
            shape: row[16],
            grading: row[17],
            pitch: row[18],
            quality: row[19],
          },
    campaign: row[20],
    additionalId: row[21] === 'nan' ? null : parseInt(row[21], 10),
  }));
}
