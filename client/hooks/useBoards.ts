import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/lib/api';

export const useBoards = (uid: string | undefined) => {
  return useQuery({
    queryKey: ['boards', uid],
    queryFn: () => boardApi.getBoards(uid as string),
    enabled: !!uid,
  });
};

export const useUpdateBoardCols = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, boardUrlID, cols }: { uid: string, boardUrlID: string, cols: any[] }) =>
      boardApi.updateCols(uid, boardUrlID, cols),
    onMutate: async ({ uid, boardUrlID, cols }) => {
      await queryClient.cancelQueries({ queryKey: ['boards', uid] });

      const previousData = queryClient.getQueryData(['boards', uid]);

      queryClient.setQueryData(['boards', uid], (old: any) => {
        if (!old || !old.boards) return old;
        return {
          ...old,
          boards: old.boards.map((b: any) => 
            b.boardUrlID === boardUrlID ? { ...b, cols } : b
          )
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['boards', variables.uid], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.uid] });
    },
  });
};

export const useAddCol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, newCol }: { uid: string, boardUrlID: string, newCol: any }) =>
      boardApi.addCol(uid, boardUrlID, newCol),
    onSuccess: (data, variables) => {
      // The API returns the updated cols array
      queryClient.setQueryData(['boards', variables.uid], (old: any) => {
        if (!old || !old.boards) return old;
        return {
          ...old,
          boards: old.boards.map((b: any) => 
            b.boardUrlID === variables.boardUrlID ? { ...b, cols: data } : b
          )
        };
      });
    }
  });
};

export const useDeleteCol = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, colID }: { uid: string, boardUrlID: string, colID: string }) =>
      boardApi.deleteCol(uid, boardUrlID, colID),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.uid] });
    }
  });
};

export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, colID, newTask }: { uid: string, boardUrlID: string, colID: string, newTask: any }) =>
      boardApi.addTask(uid, boardUrlID, colID, newTask),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.uid] });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, colID, taskIdx, updatedTask }: { uid: string, boardUrlID: string, colID: string, taskIdx: number, updatedTask: any }) =>
      boardApi.updateTask(uid, boardUrlID, colID, taskIdx, updatedTask),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['boards', variables.uid], data);
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, colIdx, taskIdx }: { uid: string, boardUrlID: string, colIdx: number, taskIdx: number }) =>
      boardApi.deleteTask(uid, boardUrlID, colIdx, taskIdx),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.uid] });
    }
  });
};

export const useUpdateBoardName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID, newName, newUrlName }: { uid: string, boardUrlID: string, newName: string, newUrlName: string }) =>
      boardApi.updateBoardName(uid, boardUrlID, newName, newUrlName),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['boards', variables.uid] });
    }
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardUrlID }: { uid: string, boardUrlID: string }) =>
      boardApi.deleteBoard(uid, boardUrlID),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['boards', variables.uid], data);
    }
  });
};

export const useAddBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, boardName }: { uid: string, boardName: string }) =>
      boardApi.addBoard(uid, boardName),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['boards', variables.uid], data);
    }
  });
};
