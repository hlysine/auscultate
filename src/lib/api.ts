import express from 'express';
import { z } from 'zod';
import { validate, wrap } from './helper';
import { patients } from './data';
import { notFound } from '@hapi/boom';

const router = express.Router();

router.get(
  '/patient',
  wrap(async (req, res) => {
    const {
      query: { id },
    } = await validate(
      req,
      z.object({
        query: z.object({
          id: z.string(),
        }),
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
