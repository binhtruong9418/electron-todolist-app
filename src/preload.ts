// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface TodoAPI {
  getTodos: () => Promise<Todo[]>;
  saveTodos: (todos: Todo[]) => Promise<boolean>;
  addTodo: (todo: { text: string }) => Promise<Todo>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  saveTodos: (todos: Todo[]) => ipcRenderer.invoke('save-todos', todos),
  addTodo: (todo: { text: string }) => ipcRenderer.invoke('add-todo', todo),
  updateTodo: (id: string, updates: Partial<Todo>) => ipcRenderer.invoke('update-todo', id, updates),
  deleteTodo: (id: string) => ipcRenderer.invoke('delete-todo', id),
} as TodoAPI);