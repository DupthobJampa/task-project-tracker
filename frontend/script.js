const taskList = document.querySelector('.task-list');
const filterButtons = document.querySelectorAll('.filter-button');

function formatLabel(value) {
    return value
        .replace('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function loadTasks() {
    const response = await fetch('http://127.0.0.1:8000/tasks?project_id=4');
    const tasks = await response.json();

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

loadTasks();