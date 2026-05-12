import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const boardApi = {
  getBoards: async (uid: string) => {
    const res = await axios.get(`${API_URL}/user_boards/${uid}`);
    return res.data;
  },

  updateCols: async (uid: string, boardUrlID: string, cols: any[]) => {
    const res = await axios.patch(`${API_URL}/user_boards/update-cols/${uid}/${boardUrlID}`, cols);
    return res.data;
  },

  addCol: async (uid: string, boardUrlID: string, newCol: any) => {
    const res = await axios.patch(`${API_URL}/user_boards/add-col/${uid}/${boardUrlID}`, newCol);
    return res.data;
  },

  deleteCol: async (uid: string, boardUrlID: string, colID: string) => {
    const res = await axios.patch(`${API_URL}/user_boards/delete-col/${uid}/${boardUrlID}/${colID}`);
    return res.data;
  },

  addTask: async (uid: string, boardUrlID: string, colID: string, newTask: any) => {
    const res = await axios.patch(`${API_URL}/user_boards/add-task/${uid}/${boardUrlID}/${colID}`, newTask);
    return res.data;
  },

  updateTask: async (uid: string, boardUrlID: string, colID: string, taskIdx: number, updatedTask: any) => {
    const res = await axios.patch(`${API_URL}/user_boards/update-task/${uid}/${boardUrlID}/${colID}/${taskIdx}`, updatedTask);
    return res.data;
  },

  deleteTask: async (uid: string, boardUrlID: string, colIdx: number, taskIdx: number) => {
    const res = await axios.delete(`${API_URL}/user_boards/delete-task/${uid}/${boardUrlID}/${colIdx}/${taskIdx}`);
    return res.data;
  },

  updateBoardName: async (uid: string, boardUrlID: string, newName: string, newUrlName: string) => {
    const res = await axios.patch(`${API_URL}/user_boards/update-board-name/${uid}/${boardUrlID}`, { boardName: newName, boardNameUrl: newUrlName });
    return res.data;
  },

  deleteBoard: async (uid: string, boardUrlID: string) => {
    const res = await axios.patch(`${API_URL}/user_boards/delete-board/${uid}/${boardUrlID}`);
    return res.data;
  },

  addBoard: async (uid: string, boardName: string) => {
    const res = await axios.patch(`${API_URL}/user_boards/add-board/${uid}`, { boardName });
    return res.data;
  }
};

export const aiApi = {
  getChats: async (uid: string) => {
    const res = await axios.get(`${API_URL}/ai/chats/${uid}`);
    return res.data;
  },

  sendMessage: async (data: { uid: string, chatId: string | null, message: string, currentBoardUrlID?: string, model?: string }) => {
    const res = await axios.post(`${API_URL}/ai/chat`, data);
    return res.data;
  },

  deleteChat: async (uid: string, chatId: string) => {
    const res = await axios.delete(`${API_URL}/ai/chat/${uid}/${chatId}`);
    return res.data;
  },

  getActions: async (uid: string) => {
    const res = await axios.get(`${API_URL}/ai/actions/${uid}`);
    return res.data;
  },

  undoAction: async (uid: string, actionId: string) => {
    const res = await axios.post(`${API_URL}/ai/undo/${actionId}`, { uid });
    return res.data;
  }
};
