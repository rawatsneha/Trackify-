import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

type Task = {
  id: string;
  title: string;
  priority: string;
  date: string;
  completed: boolean;
  subject: string;
  type: string;
};

type TaskContextType = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load tasks and dark mode
  useEffect(() => {
    const load = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) setTasks(JSON.parse(storedTasks));

        const storedDark = await AsyncStorage.getItem('darkMode');
        if (storedDark) setDarkMode(JSON.parse(storedDark));
      } catch (e) {
        console.log('Error loading', e);
      }
    };
    load();
  }, []);

  // Save tasks
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (e) {
        console.log('Error saving tasks', e);
      }
    };
    saveTasks();
  }, [tasks]);

  // Save dark mode
  useEffect(() => {
    const saveDark = async () => {
      try {
        await AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
      } catch (e) {
        console.log('Error saving darkMode', e);
      }
    };
    saveDark();
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <TaskContext.Provider value={{ tasks, setTasks, darkMode, toggleDarkMode }}>
      {children}
    </TaskContext.Provider>
  );
};

export default {};