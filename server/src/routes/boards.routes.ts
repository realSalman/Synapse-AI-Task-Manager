import { Router } from 'express';
import {
  createUserBoards,
  getUserBoards,
  getSingleBoardLegacy,
  getSingleBoard,
  addBoard,
  updateBoardName,
  deleteBoard,
  deleteTask,
  addCol,
  updateColName,
  deleteCol,
  updateCols,
  addTask,
  updateTask,
} from '../controllers/boards.controller';

const router = Router();

// ─── User Board Document ───────────────────────────────────────────────────────
router.post  ('/user_boards',                                          createUserBoards);
router.get   ('/user_boards/:uid',                                     getUserBoards);
router.get   ('/user_boards/:uid/:boardUrlID',                         getSingleBoardLegacy);
router.get   ('/:uid/boards/:boardUrlID',                              getSingleBoard);

// ─── Board CRUD ────────────────────────────────────────────────────────────────
router.patch ('/user_boards/add-board/:uid',                           addBoard);
router.patch ('/user_boards/update-board-name/:uid/:boardUrlID',       updateBoardName);
router.patch ('/user_boards/delete-board/:uid/:boardUrlID',            deleteBoard);

// ─── Column CRUD ───────────────────────────────────────────────────────────────
router.patch ('/user_boards/add-col/:uid/:boardUrlID',                 addCol);
router.patch ('/user_boards/update-col-name/:uid/:boardUrlID/:colID',  updateColName);
router.patch ('/user_boards/delete-col/:uid/:boardUrlID/:colID',       deleteCol);
router.patch ('/user_boards/update-cols/:uid/:boardUrlID',             updateCols);

// ─── Task CRUD ─────────────────────────────────────────────────────────────────
router.patch  ('/user_boards/add-task/:uid/:boardUrlID/:colID',                   addTask);
router.patch  ('/user_boards/update-task/:uid/:boardUrlID/:colID/:taskIdx',       updateTask);
router.delete ('/user_boards/delete-task/:uid/:boardUrlID/:colIndex/:taskIndex',  deleteTask);

export default router;
