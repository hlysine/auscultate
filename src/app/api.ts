import axios from 'axios';
import { FilterParams, FullPatient, RandomResult } from '../types';

export async function getPatient(patientId: number): Promise<FullPatient> {
  const response = await axios.get(`/api/patient?id=${patientId}`);
  return response.data;
}

export async function getRandomPatient(
  params: FilterParams
): Promise<RandomResult> {
  const response = await axios.get(`/api/patient/random`, { params });
  return response.data;
}
