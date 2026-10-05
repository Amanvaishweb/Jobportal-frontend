const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getToken() {
  return localStorage.getItem("jobportal_token");
}

export function decodeToken(token = getToken()) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function getAuthorities() {
  const payload = decodeToken();
  return payload?.authorities || [];
}

export function getRole() {
  return getAuthorities()[0] || null;
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // // Your current LoggingFilter requires these headers.
  // headers.set("check", "1234");
  // headers.set("body", "1234");
  //
  // const role = getRole();
  // if (role) headers.set("role", role);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok && response.status !== 204) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function login(username, password) {
  const data = await apiFetch("/Auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  localStorage.setItem("jobportal_token", data.SessionToken);
  return data;
}

export function logout() {
  localStorage.removeItem("jobportal_token");
}

export async function register(username, password) {
  return apiFetch("/user/Register", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export async function getJobs(page = 0, size = 4) {
  return apiFetch(`/Base/jobs?page=${page}&size=${size}`);
}

export async function searchJobs(keyword, page = 0, size = 4) {
  return apiFetch(`/Base/jobs/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
}

export async function getJob(id) {
  return apiFetch(`/Base/jobs/${id}`);
}

export async function createJob(job) {
  return apiFetch("/Base/save", {
    method: "POST",
    body: JSON.stringify(job)
  });
}

export async function updateJob(id, job) {
  return apiFetch(`/Base/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(job)
  });
}

export async function softDeleteJob(id) {
  return apiFetch(`/Base/jobs/${id}`, { method: "PATCH" });
}

export async function deleteJob(id) {
  return apiFetch(`/Base/jobs/${id}`, { method: "DELETE" });
}

export async function restoreJob(id) {
  return apiFetch(`/Base/jobs/restore/${id}`, { method: "PUT" });
}