import './index.css'

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TodoAPI {
  getTodos: () => Promise<Todo[]>;
  saveTodos: (todos: Todo[]) => Promise<boolean>;
  addTodo: (todo: { text: string }) => Promise<Todo>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo | null>;
  deleteTodo: (id: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: TodoAPI;
  }
}

class TodoApp {
  private todos: Todo[] = [];
  private currentFilter: 'all' | 'active' | 'completed' = 'all';
  private editingId: string | null = null;

  private elements = {
    todoForm: document.getElementById('todo-form') as HTMLFormElement,
    todoInput: document.getElementById('todo-input') as HTMLInputElement,
    todoList: document.getElementById('todo-list') as HTMLUListElement,
    totalCount: document.getElementById('total-count') as HTMLSpanElement,
    completedCount: document.getElementById('completed-count') as HTMLSpanElement,
    emptyState: document.getElementById('empty-state') as HTMLDivElement,
    clearCompleted: document.getElementById('clear-completed') as HTMLButtonElement,
    filterBtns: document.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>,
  };

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadTodos();
    this.bindEvents();
    this.render();
  }

  private async loadTodos(): Promise<void> {
    try {
      this.todos = await window.electronAPI.getTodos();
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todos = [];
    }
  }

  private bindEvents(): void {
    // Form submission
    this.elements.todoForm.addEventListener('submit', this.handleAddTodo.bind(this));

    // Filter buttons
    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter as 'all' | 'active' | 'completed';
        this.setFilter(filter);
      });
    });

    // Clear completed button
    this.elements.clearCompleted.addEventListener('click', this.handleClearCompleted.bind(this));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.setFilter('all');
            break;
          case '2':
            e.preventDefault();
            this.setFilter('active');
            break;
          case '3':
            e.preventDefault();
            this.setFilter('completed');
            break;
        }
      }
    });
  }

  private async handleAddTodo(e: Event): Promise<void> {
    e.preventDefault();
    
    const text = this.elements.todoInput.value.trim();
    if (!text) return;

    try {
      const newTodo = await window.electronAPI.addTodo({ text });
      this.todos.push(newTodo);
      this.elements.todoInput.value = '';
      this.render();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  }

  private async handleToggleTodo(id: string): Promise<void> {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const updatedTodo = await window.electronAPI.updateTodo(id, { 
        completed: !todo.completed 
      });
      
      if (updatedTodo) {
        const index = this.todos.findIndex(t => t.id === id);
        this.todos[index] = updatedTodo;
        this.render();
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  }

  private async handleDeleteTodo(id: string): Promise<void> {
    try {
      await window.electronAPI.deleteTodo(id);
      this.todos = this.todos.filter(t => t.id !== id);
      this.render();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }

  private handleEditTodo(id: string): void {
    this.editingId = id;
    this.render();
    
    // Focus the edit input
    const editInput = document.querySelector(`[data-edit-id="${id}"]`) as HTMLInputElement;
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }

  private async handleSaveEdit(id: string, newText: string): Promise<void> {
    const trimmedText = newText.trim();
    
    if (!trimmedText) {
      this.handleDeleteTodo(id);
      return;
    }

    try {
      const updatedTodo = await window.electronAPI.updateTodo(id, { text: trimmedText });
      
      if (updatedTodo) {
        const index = this.todos.findIndex(t => t.id === id);
        this.todos[index] = updatedTodo;
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
    
    this.editingId = null;
    this.render();
  }

  private handleCancelEdit(): void {
    this.editingId = null;
    this.render();
  }

  private async handleClearCompleted(): Promise<void> {
    const completedTodos = this.todos.filter(t => t.completed);
    
    try {
      for (const todo of completedTodos) {
        await window.electronAPI.deleteTodo(todo.id);
      }
      
      this.todos = this.todos.filter(t => !t.completed);
      this.render();
    } catch (error) {
      console.error('Failed to clear completed todos:', error);
    }
  }

  private setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.currentFilter = filter;
    
    // Update active filter button
    this.elements.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    this.render();
  }

  private getFilteredTodos(): Todo[] {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  private render(): void {
    this.renderTodos();
    this.renderStats();
    this.renderEmptyState();
    this.renderClearButton();
  }

  private renderTodos(): void {
    const filteredTodos = this.getFilteredTodos();
    
    this.elements.todoList.innerHTML = '';
    
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      
      if (this.editingId === todo.id) {
        li.innerHTML = this.renderEditingTodo(todo);
      } else {
        li.innerHTML = this.renderTodo(todo);
      }
      
      this.elements.todoList.appendChild(li);
    });
    
    // Bind events for rendered todos
    this.bindTodoEvents();
  }

  private renderTodo(todo: Todo): string {
    return `
      <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
           data-toggle-id="${todo.id}"></div>
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="edit-btn" data-edit-id="${todo.id}">Edit</button>
        <button class="delete-btn" data-delete-id="${todo.id}">Delete</button>
      </div>
    `;
  }

  private renderEditingTodo(todo: Todo): string {
    return `
      <input type="text" 
             class="edit-input" 
             data-edit-id="${todo.id}"
             value="${this.escapeHtml(todo.text)}"
             maxlength="200">
      <div class="todo-actions">
        <button class="edit-btn" data-save-id="${todo.id}">Save</button>
        <button class="delete-btn" data-cancel-edit="true">Cancel</button>
      </div>
    `;
  }

  private bindTodoEvents(): void {
    // Toggle todo completion
    document.querySelectorAll('[data-toggle-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.toggleId!;
        this.handleToggleTodo(id);
      });
    });

    // Delete todo
    document.querySelectorAll('[data-delete-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.deleteId!;
        this.handleDeleteTodo(id);
      });
    });

    // Edit todo
    document.querySelectorAll('[data-edit-id]:not(input)').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.editId!;
        this.handleEditTodo(id);
      });
    });

    // Save edit
    document.querySelectorAll('[data-save-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.saveId!;
        const input = document.querySelector(`input[data-edit-id="${id}"]`) as HTMLInputElement;
        if (input) {
          this.handleSaveEdit(id, input.value);
        }
      });
    });

    // Cancel edit
    document.querySelectorAll('[data-cancel-edit]').forEach(el => {
      el.addEventListener('click', () => {
        this.handleCancelEdit();
      });
    });

    // Edit input events
    document.querySelectorAll('input[data-edit-id]').forEach(el => {
      const input = el as HTMLInputElement;
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const id = input.dataset.editId!;
          this.handleSaveEdit(id, input.value);
        } else if (e.key === 'Escape') {
          this.handleCancelEdit();
        }
      });
      
      input.addEventListener('blur', () => {
        if (this.editingId) {
          const id = input.dataset.editId!;
          this.handleSaveEdit(id, input.value);
        }
      });
    });
  }

  private renderStats(): void {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    
    this.elements.totalCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    this.elements.completedCount.textContent = `${completed} completed`;
  }

  private renderEmptyState(): void {
    const filteredTodos = this.getFilteredTodos();
    const isEmpty = filteredTodos.length === 0;
    
    this.elements.emptyState.style.display = isEmpty ? 'block' : 'none';
  }

  private renderClearButton(): void {
    const hasCompleted = this.todos.some(t => t.completed);
    this.elements.clearCompleted.style.display = hasCompleted ? 'block' : 'none';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});