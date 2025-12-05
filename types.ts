export enum UserRole {
  ADMIN = 'ADMIN',
  CLEANER = 'CLEANER'
}

export enum UnitStatus {
  OPEN = 'OPEN',
  SUBMITTED = 'SUBMITTED',
  SUCCESS = 'SUCCESS',
  REWORK = 'REWORK'
}

export enum TaskType {
  CLEANING = 'CLEANING',
  INVENTORY = 'INVENTORY'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  description?: string;
  isCompleted: boolean;
  photoProofs: string[]; // Base64 strings for simulation
}

export interface Unit {
  id: string;
  name: string;
  address: string;
  deadline: string; // ISO String or "12:00 PM"
  status: UnitStatus;
  assignedUserId: string | null;
  tasks: Task[];
  lastUpdated: number;
}
