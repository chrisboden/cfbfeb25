document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskCategory = document.getElementById('taskCategory');
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

    // Update task counts
    function updateTaskCounts() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(data => {
                const tasks = data.tasks || [];
                const personalCount = tasks.filter(t => t.category === 'Personal').length;
                const businessCount = tasks.filter(t => t.category === 'Business').length;
                
                document.querySelector('.task-counts .task-count:first-child').textContent = personalCount;
                document.querySelector('.task-counts .task-count:last-child').textContent = businessCount;
                
                // Update progress bar
                const total = tasks.length;
                const completed = tasks.filter(t => t.status === 'completed').length;
                const progress = total > 0 ? (completed / total) * 100 : 0;
                document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
            });
    }

    // Load existing tasks
    function loadTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(data => {
                tasksList.innerHTML = '';
                (data.tasks || []).forEach(task => addTaskToUI(task));
                updateTaskCounts();
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                alert('Failed to load tasks. Please refresh the page.');
            });
    }

    // Handle form submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawText = taskInput.value.trim();
        const category = taskCategory.value;
        
        if (!rawText) return;

        try {
            aiResponse.classList.remove('d-none');
            
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw_text: rawText,
                    category: category
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

    // Handle task deletion
    tasksList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-task');
        if (deleteBtn) {
            const taskElement = e.target.closest('.task-item');
            const taskId = taskElement.dataset.taskId;

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
        
        taskElement.dataset.taskId = task.id;
        taskElement.querySelector('.task-content').textContent = task.content;
        
        // Set task icon
        const iconElement = taskElement.querySelector('.task-icon i');
        iconElement.className = `bi ${categoryIcons[task.category] || categoryIcons.Other}`;
        
        // Format date nicely
        const dueDate = task.due_date ? new Date(task.due_date) : null;
        const dateText = dueDate ? formatDate(dueDate) : 'No due date';
        taskElement.querySelector('.task-due-date').textContent = dateText;
        
        taskElement.querySelector('.task-category').textContent = task.category || 'Uncategorized';
        taskElement.querySelector('.task-duration').textContent = task.estimated_duration || '--';
        
        tasksList.insertBefore(taskElement, tasksList.firstChild);
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

    // Initial load
    loadTasks();
}); 