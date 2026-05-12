import { Document, Schema, model } from 'mongoose';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ISubtask {
  subtaskTitle: string;
  subtaskDone: boolean;
}

export interface ITask {
  taskTitle?: string;
  description?: string;
  subtasks: ISubtask[];
}

export interface ICol {
  colTitle?: string;
  tasks: ITask[];
}

export interface IBoard {
  boardName: string;
  cols: ICol[];
  boardUrlID: string;
  boardNameUrl: string;
}

export interface IUserBoards extends Document {
  displayName: string;
  fbaseUID: string;
  boards: IBoard[];
  createdAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateBoardUrlID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 7 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

function generateBoardNameUrl(boardName: unknown): string | undefined {
  if (!boardName) return undefined;
  const name = typeof boardName === 'string' ? boardName : String(boardName);
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-');
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const subtasksSchema = new Schema<ISubtask>({
  subtaskTitle: { type: String, required: true },
  subtaskDone:  { type: Boolean, default: false },
});

const tasksSchema = new Schema<ITask>({
  taskTitle:   { type: String },
  description: { type: String },
  subtasks:    { type: [subtasksSchema] },
});

const colsSchema = new Schema<ICol>({
  colTitle: { type: String },
  tasks:    { type: [tasksSchema] },
});

const boardsSchema = new Schema<IBoard>({
  boardName: {
    type: String,
    required: true,
    set(value: string) {
      (this as any).boardNameUrl = generateBoardNameUrl(value);
      return value;
    },
  },
  cols:         { type: [colsSchema], default: [] },
  boardUrlID:   { type: String, unique: true, default: generateBoardUrlID },
  boardNameUrl: { type: String, default: generateBoardNameUrl },
});

const userBoardsSchema = new Schema<IUserBoards>({
  displayName: { type: String, unique: true, required: true },
  fbaseUID:    { type: String, required: true, unique: true },
  boards: {
    type: [boardsSchema],
    required: true,
    validate: {
      validator: function (v: IBoard[]) {
        return v.length <= 8;
      },
      message: () => 'Maximum boards allowed: 8.',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const UserBoard = model<IUserBoards>('userBoard', userBoardsSchema, 'user_boards');
export default UserBoard;
