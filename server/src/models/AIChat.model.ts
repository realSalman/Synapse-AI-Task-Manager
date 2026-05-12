import { Document, Schema, model } from 'mongoose';

export interface IMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;      // for tool calls (tool name)
  tool_call_id?: string;
  tool_calls?: any[]; // For assistant messages making a tool call
}

export interface IAIChat extends Document {
  uid: string;
  title: string;
  aiModel: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['system', 'user', 'assistant', 'tool'], required: true },
  content: { type: String, default: '' },
  name: { type: String },
  tool_call_id: { type: String },
  tool_calls: { type: Schema.Types.Mixed }
}, { _id: false });

const aiChatSchema = new Schema<IAIChat>({
  uid: { type: String, required: true },
  title: { type: String, default: 'New Chat' },
  aiModel: { type: String, default: 'openai/gpt-4o-mini' },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

const AIChat = model<IAIChat>('AIChat', aiChatSchema, 'ai_chats');
export default AIChat;
