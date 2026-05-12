import { Document, Schema, model } from 'mongoose';

export interface IAIAction extends Document {
  uid: string;
  actionType: string;
  description: string;
  previousState: any; // snapshot of the data before the action
  targetId?: string; // ID of the affected board/column/task
  createdAt: Date;
}

const aiActionSchema = new Schema<IAIAction>({
  uid: { type: String, required: true },
  actionType: { type: String, required: true },
  description: { type: String, required: true },
  previousState: { type: Schema.Types.Mixed, required: true },
  targetId: { type: String }
}, { timestamps: true });

// TTL index to automatically delete actions after 7 days
aiActionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const AIAction = model<IAIAction>('AIAction', aiActionSchema, 'ai_actions');
export default AIAction;
