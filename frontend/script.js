const API_URL = 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://task-project-tracker.onrender.com';

const taskList = document.querySelector('.task-list');
const filterButtons = document.querySelectorAll('.filter-button');

const projectList = document.querySelector('.project-list');
const projectTitle = document.querySelector('.task-header h2');

const addTaskButton = document.querySelector('#add-task-button');
const taskForm = document.querySelector('#task-form');
const taskSubmitButton = document.querySelector('#task-submit-button');
const newProjectButton = document.querySelector('#new-project-button');
const projectForm = document.querySelector('#project-form');
const cancelEditButton = document.querySelector('#cancel-edit-button');
const deleteProjectButton = document.querySelector('#delete-project-button');

let selectedProjectId = null;
let editingTask = null;


cancelEditButton.addEventListener('click', () => {
    editingTask = null;
    taskForm.reset();
    taskForm.classList.add('hidden');
    taskSubmitButton.textContent = 'Create Task';
    cancelEditButton.classList.add('hidden');
});

deleteProjectButton.addEventListener('click', async () => {
    if (selectedProjectId === null) {
        return;
    }

    const confirmed = confirm(
        `Delete "${projectTitle.textContent}" and all of its tasks?`
    );

    if (!confirmed) {
        return;
    }

    const response = await fetch(
        `${API_URL}/projects/${selectedProjectId}`,
        {
            method: 'DELETE'
        }
    );

    if (response.ok) {
        selectedProjectId = null;
        loadProjects();
    } else {
        alert('Failed to delete project.');
    }
});

newProjectButton.addEventListener('click', () => {
    projectForm.classList.toggle('hidden');
});

addTaskButton.addEventListener('click', () => {
    if (selectedProjectId === null) {
        alert('Create a project first.');
        return;
    }

    editingTask = null;
    taskForm.reset();
    taskSubmitButton.textContent = 'Create Task';
    cancelEditButton.classList.add('hidden');

    taskForm.classList.toggle('hidden');
});

function formatLabel(value) {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadProjects(projectIdToSelect = null) {
    const response = await fetch(`${API_URL}/projects`);
    const projects = await response.json();
    projectList.innerHTML = '';

    projects.forEach((project) => {
        const item = document.createElement('li');
        item.textContent = project.name;
        item.dataset.projectId = project.id;

        item.addEventListener('click', () => {
            document.querySelectorAll('.project-list li').forEach((item) => {
                item.classList.remove('active');
            });

            item.classList.add('active');

            selectedProjectId = project.id;
            projectTitle.textContent = project.name;

            loadTasks(project.id);
        });
        projectList.appendChild(item);
    });

    let projectToSelect;
    if (projectIdToSelect !== null) {
        projectToSelect = projectList.querySelector(
            `[data-project-id="${projectIdToSelect}"]`
        );
    } else {
        projectToSelect = projectList.querySelector('li');
    }

    if (projectToSelect) {
        projectToSelect.click();
    } else {
        selectedProjectId = null;
        projectTitle.textContent = 'No Project Selected';
        taskList.innerHTML = '';
    }
}

async function loadTasks(projectId) {
    const response = await fetch(
        `${API_URL}/tasks?project_id=${projectId}`
    );

    const tasks = await response.json();
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const article = document.createElement('article');
        article.classList.add('task');
        article.dataset.status = task.status;

        const title = document.createElement('h3');
        title.textContent = task.title;

        const description = document.createElement('p');
        description.textContent = task.description || 'No description';

        const taskInfo = document.createElement('div');
        taskInfo.classList.add('task-info');

        const status = document.createElement('span');
        status.classList.add('status');
        status.textContent = formatLabel(task.status);

        const priority = document.createElement('span');
        priority.classList.add('priority');
        priority.textContent = `${formatLabel(task.priority)} Priority`;

        const dueDate = document.createElement('span');
        dueDate.classList.add('due-date');
        dueDate.textContent = task.due_date
            ? `Due: ${task.due_date}`
            : 'No Due Date';

        const editButton = document.createElement('button');
        editButton.classList.add('edit-task');
        editButton.textContent = 'Edit';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-task');
        deleteButton.textContent = 'Delete';

        taskInfo.append(
            status, 
            priority, 
            dueDate,
            editButton, 
            deleteButton
        );

        article.append(title, description, taskInfo);

        editButton.addEventListener('click', () => {
            editingTask = task;
            document.querySelector('#task-title').value = task.title;
            document.querySelector('#task-description').value = task.description || '';
            document.querySelector('#task-status').value = task.status;
            document.querySelector('#task-priority').value = task.priority;
            document.querySelector('#task-due-date').value = task.due_date || '';

            taskSubmitButton.textContent = 'Update Task';
            cancelEditButton.classList.remove('hidden');
            taskForm.classList.remove('hidden');
        });

        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm(`Delete "${task.title}"?`);

            if (!confirmed) {
                return;
            }
            const response = await fetch(
                `${API_URL}/tasks/${task.id}`,
                {
                    method: 'DELETE'
                }
            );

            if (response.ok) {
                loadTasks(selectedProjectId);
            } else {
                alert('Failed to delete task.');
            }
        });

        taskList.appendChild(article);
    });

    const activeFilter = document.querySelector('.filter-button.active');
    if (activeFilter) {
        applyFilter(activeFilter.dataset.filter);
    }
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((button) => {
            button.classList.remove('active');
        });
        button.classList.add('active');
        applyFilter(button.dataset.filter);
    });
});


taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.querySelector('#task-title').value;
    const description = document.querySelector('#task-description').value;
    const status = document.querySelector('#task-status').value;
    const priority = document.querySelector('#task-priority').value;
    const dueDate = document.querySelector('#task-due-date').value;

    const task = {
        title: title,
        description: description || null,
        status: status,
        priority: priority,
        due_date: dueDate || null
    };

    let url;
    let method;

    if (editingTask === null) {
        url = `${API_URL}/projects/${selectedProjectId}/tasks`;
        method = 'POST';
    } else {
        url = `${API_URL}/tasks/${editingTask.id}`;
        method = 'PUT';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });

    if (response.ok) {
        editingTask = null;

        taskForm.reset();
        taskForm.classList.add('hidden');
        taskSubmitButton.textContent = 'Create Task';
        cancelEditButton.classList.add('hidden');

        loadTasks(selectedProjectId);
    } else {
        alert('Failed to save task.');
    }
});


projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.querySelector('#project-name').value;
    const description = document.querySelector('#project-description').value;

    const project = {
        name: name,
        description: description || null
    };

    const response = await fetch(
        `${API_URL}/projects`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        }
    );

    if (response.ok) {
        const createdProject = await response.json();
        projectForm.reset();
        projectForm.classList.add('hidden');
        loadProjects(createdProject.id);
    } else {
        alert('Failed to create project.');
    }
});

function applyFilter(selectedFilter) {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach((task) => {
        if (
            selectedFilter === 'all' ||
            task.dataset.status === selectedFilter
        ) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}
loadProjects();
