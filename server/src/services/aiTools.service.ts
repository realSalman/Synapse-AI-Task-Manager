import UserBoard, { IBoard, ICol, ITask } from '../models/userBoards.model';
import AIAction from '../models/AIAction.model';

export class AIToolsService {
  /**
   * Logs an action to the AIAction collection for undo support.
   */
  private static async logAction(uid: string, actionType: string, description: string, previousState: any, targetId?: string) {
    await AIAction.create({
      uid,
      actionType,
      description,
      previousState,
      targetId,
    });
  }

  /**
   * Creates a new board for the user.
   */
  static async createBoard(uid: string, boardName: string) {
    const userDoc = await UserBoard.findOne({ fbaseUID: uid });
    if (!userDoc) throw new Error('User not found');
    if (userDoc.boards.length >= 8) throw new Error('Maximum boards allowed: 8');

    // Save previous state (the boards array before push)
    const previousBoards = [...userDoc.boards];
    
    const newBoard = { boardName, cols: [] };
    userDoc.boards.push(newBoard as any);
    const updated = await userDoc.save();
    
    const createdBoard = updated.boards[updated.boards.length - 1];

    await this.logAction(
      uid,
      'CREATE_BOARD',
      `Created board "${boardName}"`,
      { boards: previousBoards },
      createdBoard.boardUrlID
    );

    return createdBoard;
  }

  /**
   * Adds a column to a board.
   */
  static async addColumn(uid: string, boardUrlID: string, colTitle: string) {
    const userDoc = await UserBoard.findOne({ fbaseUID: uid });
    if (!userDoc) throw new Error('User not found');

    const board = userDoc.boards.find(b => b.boardUrlID === boardUrlID);
    if (!board) throw new Error('Board not found');

    const previousCols = [...board.cols];
    board.cols.push({ colTitle, tasks: [] } as any);
    await userDoc.save();

    await this.logAction(
      uid,
      'ADD_COLUMN',
      `Added column "${colTitle}" to board "${board.boardName}"`,
      { boardUrlID, cols: previousCols },
      boardUrlID
    );

    return board.cols[board.cols.length - 1];
  }

  /**
   * Adds a task to a column.
   */
  static async addTask(uid: string, boardUrlID: string, colID: string, taskTitle: string, description: string) {
    const userDoc = await UserBoard.findOne({ fbaseUID: uid });
    if (!userDoc) throw new Error('User not found');

    const board = userDoc.boards.find(b => b.boardUrlID === boardUrlID);
    if (!board) throw new Error('Board not found');

    const col = board.cols.find((c: any) => c._id.toString() === colID);
    if (!col) throw new Error('Column not found');

    const previousTasks = [...col.tasks];
    col.tasks.push({ taskTitle, description, subtasks: [] } as any);
    await userDoc.save();

    await this.logAction(
      uid,
      'ADD_TASK',
      `Added task "${taskTitle}" to column "${col.colTitle}"`,
      { boardUrlID, colID, tasks: previousTasks },
      boardUrlID
    );

    return col.tasks[col.tasks.length - 1];
  }

  /**
   * Deletes a board (staged action in real use, but here we implement the tool).
   */
  static async deleteBoard(uid: string, boardUrlID: string) {
    const userDoc = await UserBoard.findOne({ fbaseUID: uid });
    if (!userDoc) throw new Error('User not found');

    const boardIndex = userDoc.boards.findIndex(b => b.boardUrlID === boardUrlID);
    if (boardIndex === -1) throw new Error('Board not found');

    const boardToDelete = userDoc.boards[boardIndex];
    const previousBoards = [...userDoc.boards];
    
    userDoc.boards.splice(boardIndex, 1);
    await userDoc.save();

    await this.logAction(
      uid,
      'DELETE_BOARD',
      `Deleted board "${boardToDelete.boardName}"`,
      { boards: previousBoards },
      boardUrlID
    );

    return { success: true };
  }

  /**
   * Undoes an action by restoring the previousState.
   */
  static async undoAction(uid: string, actionId: string) {
    const action = await AIAction.findOne({ _id: actionId, uid });
    if (!action) throw new Error('Action not found or expired');

    const { actionType, previousState } = action;
    const userDoc = await UserBoard.findOne({ fbaseUID: uid });
    if (!userDoc) throw new Error('User not found');

    switch (actionType) {
      case 'CREATE_BOARD':
      case 'DELETE_BOARD':
        userDoc.boards = previousState.boards;
        break;
      case 'ADD_COLUMN':
        const boardToUpdateCol = userDoc.boards.find(b => b.boardUrlID === previousState.boardUrlID);
        if (boardToUpdateCol) {
          boardToUpdateCol.cols = previousState.cols;
        }
        break;
      case 'ADD_TASK':
        const boardToUpdateTask = userDoc.boards.find(b => b.boardUrlID === previousState.boardUrlID);
        if (boardToUpdateTask) {
          const colToUpdateTask = boardToUpdateTask.cols.find((c: any) => c._id.toString() === previousState.colID);
          if (colToUpdateTask) {
            colToUpdateTask.tasks = previousState.tasks;
          }
        }
        break;
      default:
        throw new Error(`Undo not implemented for action type: ${actionType}`);
    }

    await userDoc.save();
    // Delete the action after undoing it
    await AIAction.deleteOne({ _id: actionId });
    
    return { message: 'Action undone successfully' };
  }
}
