import { UnitStatus, UserRole, TaskType, User, Unit } from './types';

export const APP_NAME = "CleanCommand";

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Sarah Boss',
    role: UserRole.ADMIN,
    email: 'admin@clean.com',
    avatarUrl: 'https://picsum.photos/id/64/100/100'
  },
  {
    id: 'cleaner-1',
    name: 'John Cleaner',
    role: UserRole.CLEANER,
    email: 'john@clean.com',
    avatarUrl: 'https://picsum.photos/id/91/100/100'
  },
  {
    id: 'cleaner-2',
    name: 'Jane Duster',
    role: UserRole.CLEANER,
    email: 'jane@clean.com',
    avatarUrl: 'https://picsum.photos/id/177/100/100'
  }
];

export const INITIAL_UNITS: Unit[] = [
  {
    id: 'unit-101',
    name: 'Sunset Apt 101',
    address: '123 Sunset Blvd',
    deadline: '12:00 PM',
    status: UnitStatus.OPEN,
    assignedUserId: 'cleaner-1',
    lastUpdated: Date.now(),
    tasks: [
      {
        id: 't1',
        title: 'Check Kitchen Inventory',
        type: TaskType.INVENTORY,
        isCompleted: false,
        photoProofs: []
      },
      {
        id: 't2',
        title: 'Deep Clean Bathroom',
        type: TaskType.CLEANING,
        isCompleted: false,
        photoProofs: []
      }
    ]
  },
  {
    id: 'unit-204',
    name: 'Downtown Loft 204',
    address: '44 Main St',
    deadline: '02:00 PM',
    status: UnitStatus.REWORK,
    assignedUserId: 'cleaner-1',
    lastUpdated: Date.now(),
    tasks: [
      {
        id: 't3',
        title: 'Vacuum Living Room',
        type: TaskType.CLEANING,
        isCompleted: true,
        photoProofs: ['https://picsum.photos/id/20/300/300']
      },
      {
        id: 't4',
        title: 'Restock Toiletries',
        type: TaskType.INVENTORY,
        isCompleted: false, // Rework needed here
        photoProofs: []
      }
    ]
  }
];
