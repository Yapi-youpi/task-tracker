-- Run this if your database was created with the old schema (only todo, in-progress, done).
-- Adds support for statuses: in-review, in-testing.

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo', 'in-progress', 'in-review', 'in-testing', 'done'));
