export function rowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    order: row.order,
  };
}
