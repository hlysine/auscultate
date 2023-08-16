export enum Sex {
  Male = 'M',
  Female = 'F',
}

export function nameSex(sex: Sex): string {
  switch (sex) {
    case Sex.Male:
      return 'Male';
    case Sex.Female:
      return 'Female';
  }
}

export enum Diagnosis {
  Healthy = 'Healthy',
  Asthma = 'Asthma',
  COPD = 'COPD',
  URTI = 'URTI',
  LRTI = 'LRTI',
  Bronchiectasis = 'Bronchiectasis',
  Pneumonia = 'Pneumonia',
  Bronchiolitis = 'Bronchiolitis',
}

export function nameDiagnosis(diagnosis: Diagnosis) {
  if (diagnosis === Diagnosis.URTI) {
    return 'Upper respiratory tract infection';
  } else if (diagnosis === Diagnosis.LRTI) {
    return 'Lower respiratory tract infection';
  } else {
    return diagnosis;
  }
}

export enum Location {
  Trachea = 'Tc',
  AnteriorLeft = 'Al',
  AnteriorRight = 'Ar',
  PosteriorLeft = 'Pl',
  PosteriorRight = 'Pr',
  LateralLeft = 'Ll',
  LateralRight = 'Lr',
}

export function nameLocation(location: Location) {
  switch (location) {
    case Location.Trachea:
      return 'Trachea';
    case Location.AnteriorLeft:
      return 'Left anterior chest';
    case Location.AnteriorRight:
      return 'Right anterior chest';
    case Location.PosteriorLeft:
      return 'Left posterior chest';
    case Location.PosteriorRight:
      return 'Right posterior chest';
    case Location.LateralLeft:
      return 'Left lateral chest';
    case Location.LateralRight:
      return 'Right lateral chest';
  }
}

export enum AcquisitionMode {
  Sequential = 'sc',
  Simultaneous = 'mc',
}

export function nameAcquisitionMode(mode: AcquisitionMode) {
  switch (mode) {
    case AcquisitionMode.Sequential:
      return 'Sequential/single channel';
    case AcquisitionMode.Simultaneous:
      return 'Simultaneous/multi-channel';
  }
}

export enum RecordingEquipment {
  AKG_C417L_Microphone = 'AKGC417L',
  _3M_Littmann_Classic_II_SE_Stethoscope = 'LittC2SE',
  _3M_Litmmann_3200_Electronic_Stethoscope = 'Litt3200',
  WelchAllyn_Meditron_Master_Elite_Electronic_Stethoscope = 'Meditron',
}

export function nameRecordingEquipment(equipment: RecordingEquipment) {
  switch (equipment) {
    case RecordingEquipment.AKG_C417L_Microphone:
      return 'AKG C417L Microphone';
    case RecordingEquipment._3M_Littmann_Classic_II_SE_Stethoscope:
      return '3M Littmann Classic II SE Stethoscope';
    case RecordingEquipment._3M_Litmmann_3200_Electronic_Stethoscope:
      return '3M Litmmann 3200 Electronic Stethoscope';
    case RecordingEquipment.WelchAllyn_Meditron_Master_Elite_Electronic_Stethoscope:
      return 'WelchAllyn Meditron Master Elite Electronic Stethoscope';
  }
}

export interface SoundSegment {
  start: number;
  end: number;
  crackles: boolean;
  wheezes: boolean;
}

export interface AuscultationTrack {
  recordingId: string;
  audioFile: string;
  location: Location;
  acquisitionMode: AcquisitionMode;
  recordingEquipment: RecordingEquipment;
  segments: SoundSegment[];
}

export type Abnormalities = {
  crackles: boolean;
  wheezes: boolean;
};

export function getTrackAbnormalities(track: AuscultationTrack): Abnormalities {
  return track.segments.reduce<Abnormalities>(
    (abnormalities, segment) => ({
      crackles: abnormalities.crackles || segment.crackles,
      wheezes: abnormalities.wheezes || segment.wheezes,
    }),
    { crackles: false, wheezes: false }
  );
}

export interface Case {
  patientId: number;
  recordingId: string;
  age: number;
  sex: Sex;
  bmi: number | null;
  weight: number | null;
  height: number | null;
  diagnosis: Diagnosis;
  tracks: AuscultationTrack[];
}

export function getCaseAbnormalities(_case: Case): Abnormalities {
  return _case.tracks.reduce<Abnormalities>(
    (abnormalities, track) => {
      const trackAbnormalities = getTrackAbnormalities(track);
      return {
        crackles: abnormalities.crackles || trackAbnormalities.crackles,
        wheezes: abnormalities.wheezes || trackAbnormalities.wheezes,
      };
    },
    { crackles: false, wheezes: false }
  );
}

export enum SoundFilter {
  None = 'none',
  Any = 'any',
  Crackles = 'crackles',
  Wheezes = 'wheezes',
}

export function nameSoundFilter(filter: SoundFilter) {
  switch (filter) {
    case SoundFilter.None:
      return 'No abnormalities';
    case SoundFilter.Any:
      return 'Any abnormalities';
    case SoundFilter.Crackles:
      return 'Crackles';
    case SoundFilter.Wheezes:
      return 'Wheezes';
  }
}

export interface RandomResult {
  patientId: number;
  recordingId: string;
  count: number;
}

export interface FilterParams {
  location?: Location[];
  abnormalLocation?: Location[];
  sound?: SoundFilter;
  diagnosis?: Diagnosis[];
}
