import { Request, Response } from 'express';
import User from '../models/user.model';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const existingUser = await User.findOne({ fbaseUID: req.body.fbaseUID });

  if (existingUser) {
    res.status(409).json({ error: 'User already exists.' });
    return;
  }

  try {
    let displayName: string = req.body.displayName;
    let dnExists = await User.findOne({ displayName });
    let attempts = 0;

    while (dnExists) {
      attempts++;
      if (attempts <= 100) {
        displayName += Math.floor(Math.random() * 10);
      } else if (attempts <= 1000) {
        displayName += Math.floor(Math.random() * 100);
      } else {
        res.status(409).json({ error: 'Unable to generate unique display name.' });
        return;
      }
      dnExists = await User.findOne({ displayName });
    }

    const newUser = await User.create({ ...req.body, displayName });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
