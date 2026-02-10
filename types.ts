export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Role {
  ADMIN = 'Admin',
  MEMBER = 'Member',
  VIEWER = 'Viewer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  subtasks: SubTask[];
  dependencies?: string[]; // IDs of tasks that must be completed before this task
  order: number; // Position for sorting within the column
  comments: Comment[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  members: User[];
  userRoles: Record<string, Role>; // Map userId to Role
  createdAt: string;
  chatMessages: ChatMessage[];
}

export interface NotificationDraft {
  subject: string;
  body: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: Priority;
  subtasks: { title: string; completed: boolean }[];
  dependencies?: string[];
}