class TodoApp {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTodos();
    }

    bindEvents() {
        // Form submission
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    async loadTodos() {
        try {
            const response = await fetch(`${this.baseUrl}/todos`);
            const todos = await response.json();
            this.renderTodos(todos);
            this.updateStats(todos);
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showError('Failed to load todos');
        }
    }

    async addTodo() {
        const form = document.getElementById('todoForm');
        const formData = new FormData(form);
        
        const todoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority')
        };

        try {
            const response = await fetch(`${this.baseUrl}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todoData)
            });

            if (response.ok) {
                form.reset();
                this.loadTodos();
            } else {
                throw new Error('Failed to add todo');
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showError('Failed to add todo');
        }
    }

    async toggleTodo(id) {
        try {
            const response = await fetch(`${this.baseUrl}/todos/${id}/toggle`, {
                method: 'PATCH'
            });

            if (response.ok) {
                this.loadTodos();
            } else {
                throw new Error('Failed to toggle todo');
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            this.showError('Failed to update todo');
        }
    }

    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/todos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadTodos();
            } else {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showError('Failed to delete todo');
        }
    }

    async editTodo(id, newTitle, newDescription, newPriority) {
        try {
            const response = await fetch(`${this.baseUrl}/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    priority: newPriority
                })
            });

            if (response.ok) {
                this.loadTodos();
            } else {
                throw new Error('Failed to edit todo');
            }
        } catch (error) {
            console.error('Error editing todo:', error);
            this.showError('Failed to edit todo');
        }
    }

    renderTodos(todos) {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');

        // Filter todos based on current filter
        const filteredTodos = this.filterTodos(todos);

        if (filteredTodos.length === 0) {
            todoList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        todoList.style.display = 'block';
        emptyState.style.display = 'none';

        todoList.innerHTML = filteredTodos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    <span class="priority ${todo.priority}">${todo.priority}</span>
                </div>
                ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                <div class="todo-actions">
                    <button class="btn-complete" onclick="app.toggleTodo('${todo.id}')">
                        ${todo.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn-edit" onclick="app.startEdit('${todo.id}', '${this.escapeHtml(todo.title)}', '${this.escapeHtml(todo.description || '')}', '${todo.priority}')">
                        Edit
                    </button>
                    <button class="btn-delete" onclick="app.deleteTodo('${todo.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterTodos(todos) {
        switch (this.currentFilter) {
            case 'pending':
                return todos.filter(todo => !todo.completed);
            case 'completed':
                return todos.filter(todo => todo.completed);
            default:
                return todos;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.loadTodos();
    }

    updateStats(todos) {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = `Total: ${total}`;
        document.getElementById('completedTasks').textContent = `Completed: ${completed}`;
        document.getElementById('pendingTasks').textContent = `Pending: ${pending}`;
    }

    startEdit(id, currentTitle, currentDescription, currentPriority) {
        const newTitle = prompt('Edit task title:', currentTitle);
        if (newTitle === null) return;

        const newDescription = prompt('Edit task description:', currentDescription);
        if (newDescription === null) return;

        const newPriority = prompt('Edit priority (low/medium/high):', currentPriority);
        if (newPriority === null) return;

        if (newPriority && !['low', 'medium', 'high'].includes(newPriority.toLowerCase())) {
            alert('Priority must be low, medium, or high');
            return;
        }

        this.editTodo(id, newTitle, newDescription, newPriority);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the app when the page loads
const app = new TodoApp();