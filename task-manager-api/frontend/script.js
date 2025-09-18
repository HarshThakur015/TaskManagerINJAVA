/**
 * Task Manager Frontend JavaScript
 * Connects to Spring Boot REST API at http://localhost:8080/api/tasks
 */

// Configuration
const API_BASE_URL = 'http://localhost:8080/api/tasks';

// DOM Elements
const addTaskForm = document.getElementById('addTaskForm');
const taskList = document.getElementById('taskList');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const editModal = document.getElementById('editModal');
const editTaskForm = document.getElementById('editTaskForm');
const confirmModal = document.getElementById('confirmModal');
const toastContainer = document.getElementById('toastContainer');

// Global state
let tasks = [];
let currentEditTaskId = null;
let pendingConfirmAction = null;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTasks();
});

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
    // Add task form
    addTaskForm.addEventListener('submit', handleAddTask);
    
    // Edit modal
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    editTaskForm.addEventListener('submit', handleEditTask);
    
    // Confirm modal
    document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
    document.getElementById('cancelConfirm').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmAction').addEventListener('click', executeConfirmAction);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

/**
 * Load all tasks from the API
 */
async function loadTasks() {
    try {
        showLoading(true);
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        tasks = await response.json();
        renderTasks();
        updateTaskCount();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Error loading tasks. Please try again.', 'error');
        renderEmptyState();
    } finally {
        showLoading(false);
    }
}

/**
 * Handle adding a new task
 */
async function handleAddTask(event) {
    event.preventDefault();
    
    const formData = new FormData(addTaskForm);
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        status: 'PENDING'
    };
    
    // Validate input
    if (!taskData.title) {
        showToast('Please enter a task title.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newTask = await response.json();
        tasks.unshift(newTask); // Add to beginning of array
        renderTasks();
        updateTaskCount();
        addTaskForm.reset();
        showToast('Task added successfully!', 'success');
        
    } catch (error) {
        console.error('Error adding task:', error);
        showToast('Error adding task. Please try again.', 'error');
    }
}

/**
 * Handle editing a task
 */
async function handleEditTask(event) {
    event.preventDefault();
    
    const formData = new FormData(editTaskForm);
    const taskData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        status: formData.get('status')
    };
    
    // Validate input
    if (!taskData.title) {
        showToast('Please enter a task title.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${currentEditTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedTask = await response.json();
        const taskIndex = tasks.findIndex(task => task.id === currentEditTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        renderTasks();
        closeEditModal();
        showToast('Task updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating task:', error);
        showToast('Error updating task. Please try again.', 'error');
    }
}

/**
 * Mark a task as completed
 */
async function markTaskComplete(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}/complete`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedTask = await response.json();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = updatedTask;
        }
        
        renderTasks();
        showToast('Task marked as completed!', 'success');
        
    } catch (error) {
        console.error('Error marking task complete:', error);
        showToast('Error updating task. Please try again.', 'error');
    }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        tasks = tasks.filter(task => task.id !== taskId);
        renderTasks();
        updateTaskCount();
        showToast('Task deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error deleting task. Please try again.', 'error');
    }
}

/**
 * Render all tasks in the UI
 */
function renderTasks() {
    if (tasks.length === 0) {
        renderEmptyState();
        return;
    }
    
    // Sort tasks: pending first, then by creation date (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'PENDING' ? -1 : 1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    taskList.innerHTML = sortedTasks.map(task => createTaskElement(task)).join('');
    emptyState.style.display = 'none';
}

/**
 * Create HTML element for a single task
 */
function createTaskElement(task) {
    const isCompleted = task.status === 'COMPLETED';
    const createdAt = new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status ${task.status.toLowerCase()}">${task.status}</span>
            </div>
            
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            
            <div class="task-meta">
                <div class="task-date">
                    <i class="fas fa-calendar-alt"></i>
                    Created: ${createdAt}
                </div>
            </div>
            
            <div class="task-actions">
                ${!isCompleted ? `
                    <button class="btn btn-success btn-sm" onclick="markTaskComplete(${task.id})">
                        <i class="fas fa-check"></i>
                        Mark Complete
                    </button>
                ` : ''}
                
                <button class="btn btn-warning btn-sm" onclick="openEditModal(${task.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                
                <button class="btn btn-danger btn-sm" onclick="confirmDelete(${task.id})">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
}

/**
 * Render empty state when no tasks exist
 */
function renderEmptyState() {
    taskList.innerHTML = '';
    emptyState.style.display = 'block';
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
    if (show) {
        taskList.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        taskList.style.display = 'block';
    }
}

/**
 * Update task count display
 */
function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const pendingTasks = totalTasks - completedTasks;
    
    if (totalTasks === 0) {
        taskCount.textContent = '0 tasks';
    } else if (completedTasks === 0) {
        taskCount.textContent = `${totalTasks} task${totalTasks === 1 ? '' : 's'}`;
    } else {
        taskCount.textContent = `${pendingTasks} pending, ${completedTasks} completed`;
    }
}

/**
 * Open edit modal with task data
 */
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    currentEditTaskId = taskId;
    
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskStatus').value = task.status;
    
    editModal.classList.add('show');
    editModal.style.display = 'flex';
}

/**
 * Close edit modal
 */
function closeEditModal() {
    editModal.classList.remove('show');
    editModal.style.display = 'none';
    currentEditTaskId = null;
    editTaskForm.reset();
}

/**
 * Show confirmation modal for delete action
 */
function confirmDelete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    pendingConfirmAction = () => deleteTask(taskId);
    document.getElementById('confirmMessage').textContent = 
        `Are you sure you want to delete "${task.title}"? This action cannot be undone.`;
    
    confirmModal.classList.add('show');
    confirmModal.style.display = 'flex';
}

/**
 * Close confirmation modal
 */
function closeConfirmModal() {
    confirmModal.classList.remove('show');
    confirmModal.style.display = 'none';
    pendingConfirmAction = null;
}

/**
 * Execute the pending confirmation action
 */
function executeConfirmAction() {
    if (pendingConfirmAction) {
        pendingConfirmAction();
        closeConfirmModal();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <i class="toast-icon ${icon}"></i>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Allow manual close
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

/**
 * Get appropriate icon for toast type
 */
function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        case 'info':
            return 'fas fa-info-circle';
        default:
            return 'fas fa-check-circle';
    }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global functions for onclick handlers (since they're called from HTML)
window.markTaskComplete = markTaskComplete;
window.openEditModal = openEditModal;
window.confirmDelete = confirmDelete;
