const taskList = document.querySelector('.task-list');
const filterButtons = document.querySelectorAll('.filter-button');

const projectList = document.querySelector('.project-list');
const projectTitle = document.querySelector('.task-header h2');

const addTaskButton = document.querySelector('#add-task-button');
const taskForm = document.querySelector('#task-form')

const newProjectButton = document.querySelector('#new-project-button');
const projectForm = document.querySelector('#project-form');

let selectedProjectId = null;
const deleteProjectButton = document.querySelector('#delete-project-button');

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
        `http://127.0.0.1:8000/projects/${selectedProjectId}`,
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
    taskForm.classList.toggle('hidden');
});

function formatLabel(value) {
    return value
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadProjects(projectIdToSelect = null) {
    const response = await fetch('http://127.0.0.1:8000/projects');
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
    }

}

async function loadTasks(projectId) {
    const response = await fetch(
        `http://127.0.0.1:8000/tasks?project_id=${projectId}`
    );

    const tasks = await response.json();
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const article = document.createElement('article');
        article.classList.add('task');
        article.dataset.status = task.status;

        article.innerHTML = `
            <h3>${task.title}</h3>
            <div class="task-info">
                <span class="status">${formatLabel(task.status)}</span>
                <span class="priority">${formatLabel(task.priority)} Priority</span>
                <button class="delete-task">Delete</button>
            </div>
        `;
        const deleteButton = article.querySelector('.delete-task');

        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm(`Delete "${task.title}"?`);

            if (!confirmed) {
                return;
            }
            const response = await fetch(
                `http://127.0.0.1:8000/tasks/${task.id}`,
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
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((button) => {
            button.classList.remove('active');
        });

        button.classList.add('active');
        const selectedFilter = button.dataset.filter;
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
    });
});


taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.querySelector('#task-title').value;
    const status = document.querySelector('#task-status').value;
    const priority = document.querySelector('#task-priority').value;
    const dueDate = document.querySelector('#task-due-date').value;

    const task = {
        title: title,
        status: status,
        priority: priority,
        due_date: dueDate || null
    };

    const response = await fetch(
        `http://127.0.0.1:8000/projects/${selectedProjectId}/tasks`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
    );

    if (response.ok) {
        taskForm.reset();
        taskForm.classList.add('hidden');
        loadTasks(selectedProjectId);
    } else {
        alert('Failed to create task.')
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
        'http://127.0.0.1:8000/projects',
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

loadProjects();
