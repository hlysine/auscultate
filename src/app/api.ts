import axios from 'axios';
import { FilterParams, FullPatient, RandomResult } from '../types';

const SERVER_BASE_PATH = import.meta.env.VITE_SERVER_URL;

export async function getPatient(patientId: number): Promise<FullPatient> {
  const response = await axios.get(
    `${SERVER_BASE_PATH}api/patient?id=${patientId}`
  );
  return response.data;
}

export async function getRandomPatient(
  params: FilterParams
): Promise<RandomResult> {
  const response = await axios.get(`${SERVER_BASE_PATH}api/patient/random`, {
    params,
  });
  return response.data;
}

export function getDataUrl(filename: string): string {
  return `${SERVER_BASE_PATH}data/training_data/training_data/${filename}`;
}
