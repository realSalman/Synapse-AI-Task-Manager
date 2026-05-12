import { Router } from 'express';
import {
  sendMessage,
  getChats,
  deleteChat,
  getActions,
  undoAction,
} from '../controllers/ai.controller';

const router = Router();

router.post('/chat', sendMessage);
router.get('/chats/:uid', getChats);
router.delete('/chat/:uid/:chatId', deleteChat);
router.get('/actions/:uid', getActions);
router.post('/undo/:actionId', undoAction);

export default router;
