document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const tasksList = document.getElementById('tasksList');
    const taskTemplate = document.getElementById('taskTemplate');
    const aiResponse = document.getElementById('aiResponse');
    const addTaskModal = new bootstrap.Modal(document.getElementById('addTaskModal'));

    // Category icons mapping
    const categoryIcons = {
        'Business': 'bi-briefcase',
        'Personal': 'bi-person',
        'Shopping': 'bi-cart',
        'Health': 'bi-heart',
        'Other': 'bi-three-dots'
    };

    // Load tasks from backend
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();
            
            // Clear existing tasks
            tasksList.innerHTML = '';
            
            // Sort tasks: pending first, then by date
            const tasks = data.tasks || [];
            tasks.sort((a, b) => {
                // First by status (pending before completed)
                if (a.status !== b.status) {
                    return a.status === 'pending' ? -1 : 1;
                }
                // Then by due date (if exists)
                const dateA = a.due_date ? new Date(a.due_date) : new Date(a.created_at);
                const dateB = b.due_date ? new Date(b.due_date) : new Date(b.created_at);
                return dateA - dateB;
            });
            
            // Add each task to UI
            tasks.forEach(task => addTaskToUI(task));
            
            // Update counts
            updateTaskCounts();
        } catch (error) {
            console.error('Error loading tasks:', error);
            alert('Failed to load tasks. Please refresh the page.');
        }
    }

    // Update task counts
    function updateTaskCounts() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(data => {
                const tasks = data.tasks || [];
                const activeTasks = tasks.filter(t => t.status === 'pending');
                
                // Count tasks for each category
                const counts = {
                    'Personal': 0,
                    'Business': 0,
                    'Shopping': 0,
                    'Health': 0
                };
                
                // Count active tasks by category
                activeTasks.forEach(task => {
                    if (counts.hasOwnProperty(task.category)) {
                        counts[task.category]++;
                    }
                });
                
                // Update all category counts in the header
                const taskCountElements = document.querySelectorAll('.task-counts > div');
                taskCountElements.forEach(div => {
                    const category = div.querySelector('.task-type').textContent;
                    const countElement = div.querySelector('.task-count');
                    if (countElement && counts.hasOwnProperty(category)) {
                        countElement.textContent = counts[category];
                    }
                });
                
                // Update progress bar
                const total = tasks.length;
                const completed = tasks.filter(t => t.status === 'completed').length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                const progressBar = document.querySelector('.progress-bar-fill');
                if (progressBar) progressBar.style.width = `${progress}%`;
            })
            .catch(error => {
                console.error('Error updating task counts:', error);
            });
    }

    // Handle form submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawText = taskInput.value.trim();
        
        if (!rawText) return;

        try {
            aiResponse.classList.remove('d-none');
            
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw_text: rawText
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const task = await response.json();
            addTaskToUI(task);
            updateTaskCounts();
            
            // Clear input and close modal
            taskInput.value = '';
            addTaskModal.hide();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create task. Please try again.');
        } finally {
            aiResponse.classList.add('d-none');
        }
    });

    // Handle task actions (complete/delete)
    tasksList.addEventListener('click', async (e) => {
        const taskElement = e.target.closest('.task-item');
        if (!taskElement) return;
        
        const taskId = taskElement.dataset.taskId;
        
        // Handle completion toggle
        if (e.target.closest('.toggle-task')) {
            try {
                const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    throw new Error('Failed to update task');
                }

                const updatedTask = await response.json();
                updateTaskElement(taskElement, updatedTask);
                updateTaskCounts();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to update task. Please try again.');
            }
        }
        
        // Handle deletion
        if (e.target.closest('.delete-task')) {
            if (!confirm('Are you sure you want to delete this task?')) return;
            
            try {
                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }

                taskElement.remove();
                updateTaskCounts();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete task. Please try again.');
            }
        }
    });

    // Add a task to the UI
    function addTaskToUI(task) {
        const taskElement = document.importNode(taskTemplate.content, true).firstElementChild;
        updateTaskElement(taskElement, task);
        tasksList.insertBefore(taskElement, tasksList.firstChild);
    }

    // Update an existing task element
    function updateTaskElement(element, task) {
        element.dataset.taskId = task.id;
        element.querySelector('.task-content').textContent = task.content;
        
        // Set task icon
        const iconElement = element.querySelector('.task-icon i');
        iconElement.className = `bi ${categoryIcons[task.category] || categoryIcons.Other}`;
        
        // Format date nicely
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const dateText = dueDate ? formatDate(dueDate) : 'No due date';
        element.querySelector('.task-due-date').textContent = dateText;
        
        element.querySelector('.task-category').textContent = task.category || 'Uncategorized';
        element.querySelector('.task-duration').textContent = task.estimated_duration || '--';
        
        // Update completion status
        const toggleBtn = element.querySelector('.toggle-task');
        if (task.status === 'completed') {
            element.classList.add('completed');
            toggleBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
        } else {
            element.classList.remove('completed');
            toggleBtn.innerHTML = '<i class="bi bi-circle"></i>';
        }
    }

    // Format date in a user-friendly way
    function formatDate(date) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === now.toDateString()) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleString([], { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
            });
        }
    }

    // Load tasks and initialize
    loadTasks();
}); 