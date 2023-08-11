import express from 'express';
import { z } from 'zod';
import { validate, wrap } from './helper';
import { patients } from './data';
import { notFound } from '@hapi/boom';
import {
  Location,
  MurmurGrading,
  MurmurPitch,
  MurmurQuality,
  MurmurShape,
  MurmurTiming,
} from '../types';

const router = express.Router();

router.get(
  '/patient/random',
  wrap(async (req, res) => {
    const { query } = await validate(
      req,
      z.object({
        query: z
          .object({
            location: z
              .union([z.nativeEnum(Location), z.array(z.nativeEnum(Location))])
              .optional(),
            murmur: z.enum(['systolic', 'diastolic', 'any', 'none']).optional(),
            murmurLocation: z
              .union([z.nativeEnum(Location), z.array(z.nativeEnum(Location))])
              .optional(),
            mostAudible: z
              .union([z.nativeEnum(Location), z.array(z.nativeEnum(Location))])
              .optional(),
            timing: z
              .union([
                z.nativeEnum(MurmurTiming),
                z.array(z.nativeEnum(MurmurTiming)),
              ])
              .optional(),
            shape: z
              .union([
                z.nativeEnum(MurmurShape),
                z.array(z.nativeEnum(MurmurShape)),
              ])
              .optional(),
            grading: z
              .union([
                z.nativeEnum(MurmurGrading),
                z.array(z.nativeEnum(MurmurGrading)),
              ])
              .optional(),
            pitch: z
              .union([
                z.nativeEnum(MurmurPitch),
                z.array(z.nativeEnum(MurmurPitch)),
              ])
              .optional(),
            quality: z
              .union([
                z.nativeEnum(MurmurQuality),
                z.array(z.nativeEnum(MurmurQuality)),
              ])
              .optional(),
          })
          .strict(),
      })
    );
    let filtered = patients.slice();
    if (query.location) {
      const locations = Array.isArray(query.location)
        ? query.location
        : [query.location];
      filtered = filtered.filter(p =>
        p.locations.some(l => locations.includes(l))
      );
    }
    if (query.murmur) {
      if (query.murmur === 'systolic') {
        filtered = filtered.filter(p => p.systolicMurmur);
      } else if (query.murmur === 'diastolic') {
        filtered = filtered.filter(p => p.diastolicMurmur);
      } else if (query.murmur === 'none') {
        filtered = filtered.filter(
          p => !p.systolicMurmur && !p.diastolicMurmur
        );
      } else if (query.murmur === 'any') {
        filtered = filtered.filter(p => p.systolicMurmur || p.diastolicMurmur);
      }
    }
    if (query.murmurLocation) {
      const locations = Array.isArray(query.murmurLocation)
        ? query.murmurLocation
        : [query.murmurLocation];
      filtered = filtered.filter(p =>
        p.murmurLocations.some(l => locations.includes(l))
      );
    }
    if (query.mostAudible) {
      const locations = Array.isArray(query.mostAudible)
        ? query.mostAudible
        : [query.mostAudible];
      filtered = filtered.filter(
        p => p.mostAudible && locations.includes(p.mostAudible)
      );
    }
    if (query.timing) {
      const timings = Array.isArray(query.timing)
        ? query.timing
        : [query.timing];
      filtered = filtered.filter(
        p =>
          (p.systolicMurmur && timings.includes(p.systolicMurmur.timing)) ||
          (p.diastolicMurmur && timings.includes(p.diastolicMurmur.timing))
      );
    }
    if (query.shape) {
      const shapes = Array.isArray(query.shape) ? query.shape : [query.shape];
      filtered = filtered.filter(
        p =>
          (p.systolicMurmur && shapes.includes(p.systolicMurmur.shape)) ||
          (p.diastolicMurmur && shapes.includes(p.diastolicMurmur.shape))
      );
    }
    if (query.grading) {
      const gradings = Array.isArray(query.grading)
        ? query.grading
        : [query.grading];
      filtered = filtered.filter(
        p =>
          (p.systolicMurmur && gradings.includes(p.systolicMurmur.grading)) ||
          (p.diastolicMurmur && gradings.includes(p.diastolicMurmur.grading))
      );
    }
    if (query.pitch) {
      const pitches = Array.isArray(query.pitch) ? query.pitch : [query.pitch];
      filtered = filtered.filter(
        p =>
          (p.systolicMurmur && pitches.includes(p.systolicMurmur.pitch)) ||
          (p.diastolicMurmur && pitches.includes(p.diastolicMurmur.pitch))
      );
    }
    if (query.quality) {
      const qualities = Array.isArray(query.quality)
        ? query.quality
        : [query.quality];
      filtered = filtered.filter(
        p =>
          (p.systolicMurmur && qualities.includes(p.systolicMurmur.quality)) ||
          (p.diastolicMurmur && qualities.includes(p.diastolicMurmur.quality))
      );
    }
    if (filtered.length === 0) {
      throw notFound('No patients found with the given criteria');
    }
    const patient = filtered[Math.floor(Math.random() * filtered.length)];
    res.status(200).json({
      patientId: patient.patientId,
      count: filtered.length,
    });
  })
);

router.get(
  '/patient',
  wrap(async (req, res) => {
    const {
      query: { id },
    } = await validate(
      req,
      z.object({
        query: z
          .object({
            id: z.string(),
          })
          .strict(),
      })
    );
    const patient = patients.find(p => p.patientId === parseInt(id));
    if (!patient) {
      throw notFound(`Patient ${id} not found`);
    }
    res.status(200).json(patient);
  })
);

export default router;
