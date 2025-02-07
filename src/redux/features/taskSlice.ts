import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../api/tasks.data";

interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  filter: {
    category?: string;
    dueDate?: string;
    tag?: string;
    searchQuery?: string;
  };
  sortDirection: "asc" | "desc" | "";
}

const initialState: TaskState = {
  tasks: [],
  filteredTasks: [],
  filter: {},
  sortDirection: "",
};

const applyFilters = (tasks: Task[], filter: TaskState["filter"]) => {
  return tasks.filter((task) => {
    return (
      (filter.category ? task.category === filter.category : true) &&
      (filter.dueDate ? task.dueDate === filter.dueDate : true) &&
      (filter.tag ? task.tags.includes(filter.tag) : true) &&
      (filter.searchQuery
        ? task.title.toLowerCase().includes(filter.searchQuery.toLowerCase())
        : true)
    );
  });
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.filteredTasks = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<TaskState["filter"]>>) => {
      state.filter = { ...state.filter, ...action.payload };
      state.filteredTasks = applyFilters(state.tasks, state.filter);
    },
    sortTasks: (state) => {
      const sorted = [...state.filteredTasks];
      if (state.sortDirection === "asc") {
        sorted.sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
      } else if (state.sortDirection === "desc") {
        sorted.sort(
          (a, b) =>
            new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        );
      }
      state.filteredTasks = sorted;
    },
    setSortDirection: (state, action: PayloadAction<"" | "asc" | "desc">) => {
      state.sortDirection = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      state.filteredTasks = applyFilters(state.tasks, state.filter);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.filteredTasks = applyFilters(state.tasks, state.filter);
      }
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      const { id, status } = action.payload;
      const index = state.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        state.tasks[index].updatedDate = new Date().toISOString();
        state.tasks[index].history.push({
          date: new Date().toISOString(),
          action: "UPDATED",
          details: `You changed status from ${state.tasks[index].status} to ${status}`,
        });
        state.tasks[index].status = status;

        state.filteredTasks = applyFilters(state.tasks, state.filter);
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      state.filteredTasks = applyFilters(state.tasks, state.filter);
    },
  },
});

export const {
  setTasks,
  setFilter,
  sortTasks,
  setSortDirection,
  addTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = taskSlice.actions;
export default taskSlice.reducer;
