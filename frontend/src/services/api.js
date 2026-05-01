// src/services/api.js
// All communication with the Spring Boot backend lives here.
// The proxy in package.json forwards requests to https://localhost
// so we only need to write the path (e.g. "/api/tasks").

const BASE_URL = "/api";

// Helper: read the JWT token saved after login
function getToken() {
  return localStorage.getItem("token");
}

// Helper: build headers, adding Authorization if we have a token
function headers() {
  const h = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

// Helper: make a fetch call and throw on non-OK response
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: headers(),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  // Some responses (e.g. DELETE) return empty body
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ── Auth ─────────────────────────────────────────────────────────
// POST /api/users/register
export function register(username, password, fullName) {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, password, fullName }),
  });
}

// POST /api/auth/login  →  returns { token }
export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ── Users ─────────────────────────────────────────────────────────
export function getUsers() {
  return request("/users");
}

// ── Projects ──────────────────────────────────────────────────────
export function getProjects() {
  return request("/projects");
}

export function createProject(project) {
  return request("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export function deleteProject(id) {
  return request(`/projects/${id}`, { method: "DELETE" });
}

// ── Tasks ─────────────────────────────────────────────────────────
export function getTasks() {
  return request("/tasks");
}

export function getTasksByProject(projectId) {
  return request(`/tasks/project/${projectId}`);
}

export function createTask(task, projectId) {
  return request(`/tasks?projectId=${projectId}`, {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}

export function assignUsersToTask(taskId, userIds) {
  return request(`/tasks/${taskId}/assign-users`, {
    method: "PUT",
    body: JSON.stringify(userIds),
  });
}
