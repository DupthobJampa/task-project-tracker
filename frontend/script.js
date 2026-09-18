const taskList = document.querySelector('.task-list');
const filterButtons = document.querySelectorAll('.filter-button');
const projectList = document.querySelector('.project-list');
const projectTitle = document.querySelector('.task-header h2');

function formatLabel(value) {
    return value
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadProjects() {
    const response = await fetch('http://127.0.0.1:8000/projects');
    const projects = await response.json();

    projects.forEach((project) => {
        const item = document.createElement('li');
        item.textContent = project.name;
        item.dataset.projectId = project.id;

        item.addEventListener('click', () => {
            document.querySelectorAll('.project-list li').forEach((item) => {
                item.classList.remove('active');
            });

            item.classList.add('active');

            projectTitle.textContent = project.name;
            loadTasks(project.id);
        });
        projectList.appendChild(item);
    });

    const firstProject = projectList.querySelector('li');

    if (firstProject) {
        firstProject.click();
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
            </div>
        `;
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

loadProjects();
