import { create } from 'zustand';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
}

interface AIChat {
  _id: string;
  title: string;
  messages: Message[];
}

interface AIAction {
  _id: string;
  actionType: string;
  description: string;
  createdAt: string;
}

interface AIState {
  isDrawerOpen: boolean;
  drawerWidth: number;
  chats: AIChat[];
  activeChatId: string | null;
  actions: AIAction[];
  isLoading: boolean;
  
  toggleDrawer: () => void;
  setDrawerWidth: (width: number) => void;
  setChats: (chats: AIChat[]) => void;
  setActiveChatId: (id: string | null) => void;
  setActions: (actions: AIAction[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isDrawerOpen: true,
  drawerWidth: 400,
  chats: [],
  activeChatId: null,
  actions: [],
  isLoading: false,

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setDrawerWidth: (width) => set({ drawerWidth: Math.max(300, Math.min(width, 800)) }),
  setChats: (chats) => set({ chats }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  setActions: (actions) => set({ actions }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
