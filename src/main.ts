import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'fs';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const dataPath = path.join(app.getPath('userData'), 'todos.json');

// Load todos from file
const loadTodos = (): any[] => {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return [];
};

// Save todos to file
const saveTodos = (todos: any[]): void => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(todos, null, 2));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

// IPC handlers for todo operations
ipcMain.handle('get-todos', () => {
  return loadTodos();
});

ipcMain.handle('save-todos', (_, todos) => {
  saveTodos(todos);
  return true;
});

ipcMain.handle('add-todo', (_, todo) => {
  const todos = loadTodos();
  const newTodo = {
    id: Date.now().toString(),
    text: todo.text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
});

ipcMain.handle('update-todo', (_, id, updates) => {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates };
    saveTodos(todos);
    return todos[index];
  }
  return null;
});

ipcMain.handle('delete-todo', (_, id) => {
  const todos = loadTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  saveTodos(filteredTodos);
  return true;
});