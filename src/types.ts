export enum Location {
  Pulmonary = 'PV',
  Tricuspid = 'TV',
  Aortic = 'AV',
  Mitral = 'MV',
  Other = 'Phc',
}

export function nameLocation(location: Location) {
  switch (location) {
    case Location.Pulmonary:
      return 'Pulmonary valve';
    case Location.Tricuspid:
      return 'Tricuspid valve';
    case Location.Aortic:
      return 'Aortic valve';
    case Location.Mitral:
      return 'Mitral valve';
    case Location.Other:
      return 'Other locations';
  }
}

export enum MurmurFilter {
  None = 'none',
  Any = 'any',
  Systolic = 'systolic',
  Diastolic = 'diastolic',
}

export function nameMurmur(murmur: MurmurFilter): string {
  switch (murmur) {
    case MurmurFilter.Systolic:
      return 'Systolic murmur';
    case MurmurFilter.Diastolic:
      return 'Diastolic murmur';
    case MurmurFilter.None:
      return 'No murmur';
    case MurmurFilter.Any:
      return 'Has murmur';
  }
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

export function nameTiming(
  timing: MurmurTiming,
  type: 'systolic' | 'diastolic' | 'general' = 'general'
) {
  let prefix: string = timing;

  if (timing === MurmurTiming.Holo) {
    prefix = 'Pan';
  }

  if (type === 'general') {
    return prefix;
  } else return prefix + '-' + type;
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

export interface FullPatient extends Patient, Auscultation {}

export interface RandomResult {
  patientId: number;
  count: number;
}

export interface FilterParams {
  location?: Location[];
  murmur?: MurmurFilter;
  murmurLocation?: Location[];
  mostAudible?: Location[];
  timing?: MurmurTiming[];
  shape?: MurmurShape[];
  grading?: MurmurGrading[];
  pitch?: MurmurPitch[];
  quality?: MurmurQuality[];
}
