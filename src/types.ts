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
  Early = 'Early',
  Holo = 'Holo',
  Late = 'Late',
  Mid = 'Mid',
}

export function getTiming(desc: string): MurmurTiming {
  if (desc.startsWith(MurmurTiming.Early)) {
    return MurmurTiming.Early;
  } else if (desc.startsWith(MurmurTiming.Holo)) {
    return MurmurTiming.Holo;
  } else if (desc.startsWith(MurmurTiming.Late)) {
    return MurmurTiming.Late;
  } else if (desc.startsWith(MurmurTiming.Mid)) {
    return MurmurTiming.Mid;
  } else {
    throw new Error(`Unknown timing: ${desc}`);
  }
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

export enum SoundWave {
  S1 = 1,
  Systolic = 2,
  S2 = 3,
  Diastolic = 4,
  Unknown = 0,
}

export interface SoundSegment {
  start: number;
  end: number;
  type: SoundWave;
}

export interface AuscultationTrack {
  location: Location;
  headerFile: string;
  audioFile: string;
  segments: SoundSegment[];
}

export interface Auscultation {
  patientId: number;
  tracks: AuscultationTrack[];
}
