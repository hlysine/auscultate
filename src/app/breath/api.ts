import axios from 'axios';
import { FilterParams, Case, RandomResult } from '../../breath-types';

const SERVER_BASE_PATH = import.meta.env.VITE_SERVER_URL;

export async function getCase(
  patientId: number,
  recordingId: string
): Promise<Case> {
  const response = await axios.get(
    `${SERVER_BASE_PATH}api/breath/case?patientId=${patientId}&recordingId=${recordingId}`
  );
  return response.data;
}

export async function getRandomCase(
  params: FilterParams
): Promise<RandomResult> {
  const response = await axios.get(
    `${SERVER_BASE_PATH}api/breath/case/random`,
    {
      params,
    }
  );
  return response.data;
}

export function getDataUrl(filename: string): string {
  return `${SERVER_BASE_PATH}breath-data/Respiratory_Sound_Database/Respiratory_Sound_Database/audio_and_txt_files/${filename}`;
}
