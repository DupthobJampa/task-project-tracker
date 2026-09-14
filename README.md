# Task & Project Tracker API
A REST API for managing projects and tasks, built with Python, FastAPI, and PostgreSQL.

The project demonstrates backend API development, relational database design, SQL queries, validation, and basic shell scripting.

## Features

- Create and list projects
- Create, view, update, and delete tasks
- Filter tasks by status and project
- Track task priority, status, due dates, and timestamps
- View project task summaries
- Database reset script to recreate schema
- Automatic `updated_at` timestamp using a PostgreSQL trigger

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- psycopg2
- Pydantic
- Shell scripting

## Project Structure

```text
task-project-tracker-api/

├── app/
│   ├── __init__.py
│   ├── database.py
│   └── main.py
├── scripts/
│   ├── reset_db.sh
│   └── run.sh
├── sql/
│   └── schema.sql
├── requirements.txt
└── README.md
```
## Database Design
The database contains two main tables:
- `projects` - stores project details
- `tasks` - stores tasks belonging to a project through `project_id`

Tasks include status, priority, due dates, and timestamps. PostgreSQL constraints validate status and priority values, while a trigger automatically updates `updated_at` when a task is modified.

## Setup

Requires Python and PostgreSQL.

```bash
git clone https://github.com/DupthobJampa/task-project-tracker-api.git
cd task-project-tracker-api

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

./scripts/reset_db.sh
./scripts/run.sh
```

The API runs at `http://127.0.0.1:8000` with interactive documentation at `/docs`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a project |
| GET | `/tasks` | List and filter tasks |
| GET | `/tasks/{task_id}` | Get a specific task |
| POST | `/projects/{project_id}/tasks` | Create a task for a project |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |
| GET | `/projects/{project_id}/summary` | View a project's task summary |


Tasks can be filtered using query parameters:

`/tasks?status=todo`

`/tasks?project_id=1`

`/tasks?status=todo&project_id=1`
