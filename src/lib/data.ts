import { parse } from '@vanillaes/csv';
import fs from 'fs/promises';

const DATA_DIR = 'dist/app/data/';

export enum Location {
  Pulmonary = 'PV',
  Tricuspid = 'TV',
  Aortic = 'AV',
  Mitral = 'MV',
  Other = 'Phc',
}

export enum Age {
  Neonate = 'Neonate',
  Infant = 'Infant',
  Child = 'Child',
  Adolescent = 'Adolescent',
  YoungAdult = 'Young adult',
}

export enum Sex {
  Male = 'Male',
  Female = 'Female',
}

export enum MurmurStatus {
  Present = 'Present',
  Absent = 'Absent',
  Unknown = 'Unknown',
}

export enum MurmurTiming {
  EarlySystolic = 'Early-systolic',
  Holosystolic = 'Holosystolic',
  LateSystolic = 'Late-systolic',
  MidSystolic = 'Mid-systolic',
}

export enum MurmurShape {
  Crescendo = 'Crescendo',
  Decrescendo = 'Decrescendo',
  Diamond = 'Diamond',
  Plateau = 'Plateau',
}

export enum MurmurPitch {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum MurmurGrading {
  Grade1 = 'I/VI',
  Grade2 = 'II/VI',
  Grade3 = 'III/VI',
}

export enum MurmurQuality {
  Blowing = 'Blowing',
  Harsh = 'Harsh',
  Musical = 'Musical',
}

export enum Campaign {
  CC2015 = 'CC2015',
  CC2014 = 'CC2014',
}

export interface Murmur {
  timing: MurmurTiming;
  shape: MurmurShape;
  grading: MurmurGrading;
  pitch: MurmurPitch;
  quality: MurmurQuality;
}

export interface Patient {
  patientId: number;
  locations: Location[];
  age: Age | null;
  sex: Sex;
  height: number | null;
  weight: number | null;
  isPregnant: boolean;
  murmur: MurmurStatus;
  murmurLocations: Location[];
  mostAudible: Location | null;
  systolicMurmur: Murmur | null;
  diastolicMurmur: Murmur | null;
  campaign: Campaign;
  additionalId: number | null;
}

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
            timing: row[10],
            shape: row[11],
            grading: row[12],
            pitch: row[13],
            quality: row[14],
          },
    diastolicMurmur:
      row[15] === 'nan'
        ? null
        : {
            timing: row[15],
            shape: row[16],
            grading: row[17],
            pitch: row[18],
            quality: row[19],
          },
    campaign: row[20],
    additionalId: row[21] === 'nan' ? null : parseInt(row[21], 10),
  }));
}
