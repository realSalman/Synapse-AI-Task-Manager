import { Request, Response } from 'express';
import UserBoard from '../models/userBoards.model';

// POST /api/user_boards — create user board document
export const createUserBoards = async (req: Request, res: Response): Promise<void> => {
  const existing = await UserBoard.findOne({ fbaseUID: req.body.fbaseUID });
  if (existing) {
    res.status(409).json({ error: 'User board document already exists.' });
    return;
  }
  try {
    const doc = await UserBoard.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// GET /api/user_boards/:uid — get all boards for a user
export const getUserBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await UserBoard.findOne({ fbaseUID: req.params.uid });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// GET /api/user_boards/:uid/:boardUrlID — get single board (legacy path)
export const getSingleBoardLegacy = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await UserBoard.findOne({ fbaseUID: req.params.uid });
    const board = doc?.boards.find((b) => b.boardUrlID === req.params.boardUrlID);
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// GET /:uid/boards/:boardUrlID — get single board (projection path)
export const getSingleBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await UserBoard.findOne(
      {
        fbaseUID: req.params.uid,
        boards: { $elemMatch: { boardUrlID: req.params.boardUrlID } },
      },
      { 'boards.$': 1 }
    );
    res.json(doc?.boards[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/add-board/:uid
export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await UserBoard.findOne({ fbaseUID: req.params.uid });
    if (!doc) {
      res.status(404).json({ error: 'No boards document found.' });
      return;
    }
    if (doc.boards.length >= 8) {
      res.status(400).json({ error: 'Maximum boards allowed: 8.' });
      return;
    }
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid },
      { $push: { boards: req.body } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/update-board-name/:uid/:boardUrlID
export const updateBoardName = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid, 'boards.boardUrlID': req.params.boardUrlID },
      {
        $set: {
          'boards.$.boardName':    req.body.boardName,
          'boards.$.boardNameUrl': req.body.boardNameUrl,
        },
      },
      { new: true }
    );
    const board = updated?.boards.find((b) => b.boardUrlID === req.params.boardUrlID);
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/delete-board/:uid/:boardUrlID
export const deleteBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid },
      { $pull: { boards: { boardUrlID: req.params.boardUrlID } } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// DELETE /api/user_boards/delete-task/:uid/:boardUrlID/:colIndex/:taskIndex
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserBoard.findOne({ fbaseUID: req.params.uid });
    if (!user) { res.status(404).json({ error: 'User not found.' }); return; }

    const board = user.boards.find((b) => b.boardUrlID === req.params.boardUrlID);
    if (!board) { res.status(404).json({ error: 'Board not found.' }); return; }

    const col = board.cols[Number(req.params.colIndex)];
    if (!col) { res.status(404).json({ error: 'Column not found.' }); return; }

    col.tasks.splice(Number(req.params.taskIndex), 1);
    await user.save();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/add-col/:uid/:boardUrlID
export const addCol = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid, 'boards.boardUrlID': req.params.boardUrlID },
      { $push: { 'boards.$[board].cols': req.body } },
      { new: true, arrayFilters: [{ 'board.boardUrlID': req.params.boardUrlID }] }
    );
    const cols = updated?.boards.find((b) => b.boardUrlID === req.params.boardUrlID)?.cols;
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/update-col-name/:uid/:boardUrlID/:colID
export const updateColName = async (req: Request, res: Response): Promise<void> => {
  try {
    await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid },
      { $set: { 'boards.$[board].cols.$[col].colTitle': req.body.colTitle } },
      {
        new: true,
        arrayFilters: [
          { 'board.boardUrlID': req.params.boardUrlID },
          { 'col._id': req.params.colID },
        ],
      }
    );
    res.status(200).json({ message: 'Column name updated.' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/delete-col/:uid/:boardUrlID/:colID
export const deleteCol = async (req: Request, res: Response): Promise<void> => {
  try {
    await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid },
      { $pull: { 'boards.$[board].cols': { _id: req.params.colID } } },
      { new: true, arrayFilters: [{ 'board.boardUrlID': req.params.boardUrlID }] }
    );
    res.status(200).json({ message: 'Column deleted.' });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/update-cols/:uid/:boardUrlID
export const updateCols = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid, 'boards.boardUrlID': req.params.boardUrlID },
      { $set: { 'boards.$[board].cols': req.body } },
      { new: true, arrayFilters: [{ 'board.boardUrlID': req.params.boardUrlID }] }
    );
    const cols = updated?.boards.find((b) => b.boardUrlID === req.params.boardUrlID)?.cols;
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/add-task/:uid/:boardUrlID/:colID
export const addTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      {
        fbaseUID: req.params.uid,
        'boards.boardUrlID': req.params.boardUrlID,
        'boards.cols._id': req.params.colID,
      },
      { $push: { 'boards.$[board].cols.$[col].tasks': req.body } },
      {
        new: true,
        arrayFilters: [
          { 'board.boardUrlID': req.params.boardUrlID },
          { 'col._id': req.params.colID },
        ],
      }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// PATCH /api/user_boards/update-task/:uid/:boardUrlID/:colID/:taskIdx
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await UserBoard.findOneAndUpdate(
      { fbaseUID: req.params.uid },
      {
        $set: {
          [`boards.$[board].cols.$[col].tasks.${req.params.taskIdx}`]: req.body,
        },
      },
      {
        new: true,
        arrayFilters: [
          { 'board.boardUrlID': req.params.boardUrlID },
          { 'col._id': req.params.colID },
        ],
      }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
