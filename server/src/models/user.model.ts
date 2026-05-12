import { Document, Schema, model } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  displayName:   string;
  firstName:     string;
  surname?:      string | null;
  loginProvider: 'email' | 'google' | 'facebook';
  email:         string;
  fbaseUID:      string;
  createdAt:     Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const usersSchema = new Schema<IUser>({
  displayName:   { type: String, unique: true, required: true },
  firstName:     { type: String, required: true },
  surname:       { type: String, default: null },
  loginProvider: { type: String, enum: ['email', 'google', 'facebook'], required: true },
  email:         { type: String, required: true, unique: true },
  fbaseUID:      { type: String, required: true, unique: true },
  createdAt:     { type: Date, default: Date.now },
});

const User = model<IUser>('User', usersSchema, 'users');
export default User;
