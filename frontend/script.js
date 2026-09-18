const filterButtons = document.querySelectorAll('.filter-button');
const tasks = document.querySelectorAll('.task');
filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((button) => {
            button.classList.remove('active');
        });
        button.classList.add('active');
        const selectedFilter = button.dataset.filter;
        tasks.forEach((task) => {
            if (selectedFilter === 'all' || task.dataset.status === selectedFilter) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        });
    });
});