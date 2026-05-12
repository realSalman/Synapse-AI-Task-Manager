import { Request, Response } from 'express';
import AIChat, { IMessage } from '../models/AIChat.model';
import AIAction from '../models/AIAction.model';
import { AIToolsService } from '../services/aiTools.service';
import axios from 'axios';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_board',
      description: 'Creates a new board.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the board.' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_column',
      description: 'Adds a new column to a specific board.',
      parameters: {
        type: 'object',
        properties: {
          boardUrlID: { type: 'string', description: 'The unique ID of the board.' },
          colTitle: { type: 'string', description: 'The title of the column.' },
        },
        required: ['boardUrlID', 'colTitle'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_task',
      description: 'Adds a new task to a column.',
      parameters: {
        type: 'object',
        properties: {
          boardUrlID: { type: 'string', description: 'The unique ID of the board.' },
          colID: { type: 'string', description: 'The ID of the column.' },
          taskTitle: { type: 'string', description: 'The title of the task.' },
          description: { type: 'string', description: 'Detailed description of the task.' },
        },
        required: ['boardUrlID', 'colID', 'taskTitle'],
      },
    },
  },
];

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { chatId, message, uid, model = 'openai/gpt-4o-mini', currentBoardUrlID } = req.body;
  const API_KEY = process.env.OPENROUTER_API_KEY;

  if (!API_KEY || API_KEY === 'your_openrouter_key_here') {
    res.status(400).json({ error: 'OpenRouter API Key is missing. Please set OPENROUTER_API_KEY in your server/.env' });
    return;
  }

  try {
    let chat = await AIChat.findOne({ _id: chatId, uid });
    if (!chat) {
      chat = await AIChat.create({ uid, aiModel: model, messages: [] });
    }

    // Add user message
    const userMsg: IMessage = { role: 'user', content: message };
    chat.messages.push(userMsg);

    const systemContext = [
      'You are Synapse, a helpful AI assistant for Synapse AI Task Manager.',
      'You can manage boards, columns, and tasks using the provided tools.',
      currentBoardUrlID ? `The user is currently viewing the board with ID: ${currentBoardUrlID}. If they refer to "this board", use this ID.` : '',
      'Be concise and professional.'
    ].filter(Boolean).join(' ');

    // Call OpenRouter
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: chat.aiModel || model,
        messages: [
          { role: 'system', content: systemContext },
          ...chat.messages.map(m => ({
            role: m.role,
            content: m.content,
            tool_calls: m.tool_calls,
            tool_call_id: m.tool_call_id,
            name: m.name
          })),
        ],
        tools: TOOLS,
        tool_choice: 'auto',
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const assistantMsg = response.data.choices[0].message;
    chat.messages.push(assistantMsg);

    // Handle Tool Calls
    if (assistantMsg.tool_calls) {
      for (const toolCall of assistantMsg.tool_calls) {
        const { name } = toolCall.function;
        const args = JSON.parse(toolCall.function.arguments);
        let result;

        try {
          switch (name) {
            case 'create_board':
              result = await AIToolsService.createBoard(uid, args.name);
              break;
            case 'add_column':
              result = await AIToolsService.addColumn(uid, args.boardUrlID, args.colTitle);
              break;
            case 'add_task':
              result = await AIToolsService.addTask(uid, args.boardUrlID, args.colID, args.taskTitle, args.description || '');
              break;
            default:
              result = { error: 'Tool not found' };
          }
        } catch (err: any) {
          result = { error: err.message };
        }

        chat.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: name,
          content: JSON.stringify(result),
        });
      }

      // Get final response after tool execution
      const finalResponse = await axios.post(
        OPENROUTER_URL,
        {
          model: chat.aiModel || model,
          messages: [
            { role: 'system', content: systemContext },
            ...chat.messages.map(m => ({
              role: m.role,
              content: m.content,
              tool_calls: m.tool_calls,
              tool_call_id: m.tool_call_id,
              name: m.name
            })),
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const finalAssistantMsg = finalResponse.data.choices[0].message;
      chat.messages.push(finalAssistantMsg);
    }

    await chat.save();
    res.json(chat);
  } catch (err: any) {
    console.error('AI Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
};

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const chats = await AIChat.find({ uid: req.params.uid }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    await AIChat.deleteOne({ _id: req.params.chatId, uid: req.params.uid });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const getActions = async (req: Request, res: Response): Promise<void> => {
  try {
    const actions = await AIAction.find({ uid: req.params.uid }).sort({ createdAt: -1 });
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const undoAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AIToolsService.undoAction(req.body.uid, req.params.actionId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
