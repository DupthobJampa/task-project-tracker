from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.database import get_connection
from fastapi.middleware.cors import CORSMiddleware

TaskStatus = Literal["todo", "in_progress", "completed"]
TaskPriority = Literal["low", "medium", "high"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = "todo"
    priority: TaskPriority = "medium"
    due_date: date | None = None

class TaskUpdate(BaseModel):
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    due_date: date | None


@app.get("/")
def root():
    return {"message": "Task Project Tracker API is running"}

@app.get("/tasks")
def get_tasks(
    status: TaskStatus | None = None,
    project_id: int | None = None,
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            query = "SELECT * FROM TASKS"
            conditions = []
            values = []

            if status is not None:
                conditions.append("status = %s")
                values.append(status)

            if project_id is not None:
                conditions.append("project_id = %s")
                values.append(project_id)

            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            query += " ORDER BY id;"

            cur.execute(query, values)
            tasks = cur.fetchall()

    return tasks

@app.get("/projects")
def get_projects():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM projects ORDER by id;"
                )
            projects = cur.fetchall()

    return projects

@app.post("/projects")
def create_project(project: ProjectCreate):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO projects (name,description)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (project.name, project.description)
            )
            new_project = cur.fetchone()

        conn.commit()
    return new_project


@app.post("/projects/{project_id}/tasks")
def create_task(project_id: int, task: TaskCreate):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO tasks (
                project_id,
                title,
                description,
                status,
                priority,
                due_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *;
                """,
                (
                    project_id,
                    task.title,
                    task.description,
                    task.status,
                    task.priority,
                    task.due_date
                )
            )

            new_task = cur.fetchone()

        conn.commit()

    return new_task

@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT *
                FROM TASKS
                WHERE id = %s
                """
                , (task_id,)
            )
            task = cur.fetchone()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )
    return task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE tasks
                SET title = %s,
                    description = %s,
                    status = %s,
                    priority = %s,
                    due_date = %s
                WHERE id = %s
                RETURNING *;
                """,
                (
                    task.title,
                    task.description,
                    task.status,
                    task.priority,
                    task.due_date,
                    task_id
                )
            )
            updated_task = cur.fetchone()

            if updated_task is None:
                raise HTTPException(
                    status_code =404,
                    detail="Task not found"
                )
            conn.commit()
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM TASKS
                WHERE id = %s
                RETURNING *;
                """,
                (task_id,)
            )

            deleted_task = cur.fetchone()

            if deleted_task is None:
                raise HTTPException(
                    status_code=404,
                    detail="Task not found"
                )
            conn.commit()
    return deleted_task

@app.get("/projects/{project_id}/summary")
def get_project_summary(project_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.name,
                    COUNT(t.id) AS total_tasks,
                    COUNT(t.id) FILTER (
                        WHERE t.status = 'todo'
                    ) AS todo,
                    COUNT(t.id) FILTER (
                        WHERE t.status = 'in_progress'
                    ) AS in_progress,
                    COUNT(t.id) FILTER (
                        WHERE t.status = 'completed'
                    ) AS completed
                    FROM projects p
                    LEFT JOIN tasks t
                        ON p.id = t.project_id
                    WHERE p.id = %s
                    GROUP BY p.id, p.name;
                    """,
                    (project_id,)
            )
            summary = cur.fetchone()

    if summary is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )
    return summary

@app.delete("/projects/{project_id}")

def delete_project(project_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM projects
                WHERE id = %s
                RETURNING *;
                """,
                (project_id,)
            )

            deleted_project = cur.fetchone()
            if deleted_project is None:
                raise HTTPException(
                    status_code=404,
                    detail="Project not found"
                )
            conn.commit()
    return deleted_project