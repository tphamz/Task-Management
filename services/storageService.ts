import { Unit, User, UnitStatus } from '../types';
import { MOCK_USERS, INITIAL_UNITS } from '../constants';

const STORAGE_KEYS = {
  UNITS: 'cleancommand_units',
  USERS: 'cleancommand_users',
  SESSION: 'cleancommand_session'
};

// Initialize Storage
const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.UNITS)) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(INITIAL_UNITS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
};

initStorage();

export const StorageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  getUnits: (): Unit[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.UNITS) || '[]');
  },

  updateUnit: (updatedUnit: Unit): void => {
    const units = StorageService.getUnits();
    const index = units.findIndex(u => u.id === updatedUnit.id);
    if (index !== -1) {
      units[index] = { ...updatedUnit, lastUpdated: Date.now() };
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
    }
  },

  addUnit: (newUnit: Unit): void => {
    const units = StorageService.getUnits();
    units.push(newUnit);
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  },

  login: (email: string): User | null => {
    const users = StorageService.getUsers();
    // Simplified login for demo
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  }
};
