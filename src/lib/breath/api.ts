import express from 'express';
import { z } from 'zod';
import { validate, wrap } from '../helper';
import { cases } from './data';
import { notFound } from '@hapi/boom';
import {
  Diagnosis,
  Location,
  RandomResult,
  SoundFilter,
  getCaseAbnormalities,
  getTrackAbnormalities,
} from '../../breath-types';

const router = express.Router();

router.get(
  '/case/random',
  wrap(async (req, res) => {
    const { query } = await validate(
      req,
      z.object({
        query: z
          .object({
            location: z
              .union([z.nativeEnum(Location), z.array(z.nativeEnum(Location))])
              .optional(),
            abnormalLocation: z
              .union([z.nativeEnum(Location), z.array(z.nativeEnum(Location))])
              .optional(),
            sound: z.nativeEnum(SoundFilter).optional(),
            diagnosis: z
              .union([
                z.nativeEnum(Diagnosis),
                z.array(z.nativeEnum(Diagnosis)),
              ])
              .optional(),
          })
          .strict(),
      })
    );
    let filtered = cases.slice();
    if (query.location) {
      const locations = Array.isArray(query.location)
        ? query.location
        : [query.location];
      filtered = filtered.filter(p =>
        p.tracks.some(l => locations.includes(l.location))
      );
    }
    if (query.abnormalLocation) {
      const locations = Array.isArray(query.abnormalLocation)
        ? query.abnormalLocation
        : [query.abnormalLocation];
      filtered = filtered.filter(p =>
        p.tracks.some(l => {
          const abnormalities = getTrackAbnormalities(l);
          return (
            (abnormalities.crackles || abnormalities.wheezes) &&
            locations.includes(l.location)
          );
        })
      );
    }
    if (query.sound) {
      if (query.sound === SoundFilter.None) {
        filtered = filtered.filter(p => {
          const abnormalities = getCaseAbnormalities(p);
          return !abnormalities.crackles && !abnormalities.wheezes;
        });
      } else if (query.sound === SoundFilter.Any) {
        filtered = filtered.filter(p => {
          const abnormalities = getCaseAbnormalities(p);
          return abnormalities.crackles || abnormalities.wheezes;
        });
      } else if (query.sound === SoundFilter.Crackles) {
        filtered = filtered.filter(p => {
          const abnormalities = getCaseAbnormalities(p);
          return abnormalities.crackles;
        });
      } else if (query.sound === SoundFilter.Wheezes) {
        filtered = filtered.filter(p => {
          const abnormalities = getCaseAbnormalities(p);
          return abnormalities.wheezes;
        });
      }
    }
    if (query.diagnosis) {
      const diagnoses = Array.isArray(query.diagnosis)
        ? query.diagnosis
        : [query.diagnosis];
      filtered = filtered.filter(p => diagnoses.includes(p.diagnosis));
    }

    if (filtered.length === 0) {
      throw notFound('No cases found with the given criteria');
    }
    const _case = filtered[Math.floor(Math.random() * filtered.length)];
    res.status(200).json({
      patientId: _case.patientId,
      recordingId: _case.recordingId,
      count: filtered.length,
    } satisfies RandomResult);
  })
);

router.get(
  '/case',
  wrap(async (req, res) => {
    const {
      query: { patientId, recordingId },
    } = await validate(
      req,
      z.object({
        query: z
          .object({
            patientId: z.string(),
            recordingId: z.string(),
          })
          .strict(),
      })
    );
    const _case = cases.find(
      p => p.patientId === parseInt(patientId) && p.recordingId === recordingId
    );
    if (!_case) {
      throw notFound(`Case ${patientId}_${recordingId} not found`);
    }
    res.status(200).json(_case);
  })
);

export default router;
