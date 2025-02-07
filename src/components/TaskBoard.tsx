import { useMemo, useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsThreeDots } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import {
  deleteTask,
  setSortDirection,
  setTasks,
  sortTasks,
  addTask,
  updateTaskStatus,
} from "../redux/features/taskSlice";
import dummyTasks, { Task } from "../api/tasks.data";
import { RootState } from "../redux/store";
import { CustomSelect, ViewOrEdit } from ".";
import TaskInputRow from "./Table/TaskInputRow"; // reuse input row component if it fits the design
import { formatDisplayDate } from "../utils/helper";
import "./TaskBoard.css"; // new CSS file for board styling

interface TaskBoardProps {
  categories: string[];
  statuses: string[];
}

const INITIAL_TASK: Task = {
  id: "",
  title: "",
  description: "",
  category: "",
  dueDate: "",
  status: "",
  priority: "",
  tags: [],
  attachments: [],
  createdDate: "",
  updatedDate: "",
  history: [],
};

export const TaskBoard = ({ categories, statuses }: TaskBoardProps) => {
  const dispatch = useDispatch();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<Task>(INITIAL_TASK);

  const { filteredTasks, sortDirection } = useSelector(
    (state: RootState) => state.tasks
  );

  // Group tasks by status
  const categorizedTasks: {
    "TO-DO": Task[];
    "IN-PROGRESS": Task[];
    COMPLETED: Task[];
  } = useMemo(() => {
    return {
      "TO-DO": filteredTasks.filter((task: Task) => task.status === "TO-DO"),
      "IN-PROGRESS": filteredTasks.filter(
        (task: Task) => task.status === "IN-PROGRESS"
      ),
      COMPLETED: filteredTasks.filter(
        (task: Task) => task.status === "COMPLETED"
      ),
    };
  }, [filteredTasks]);

  const toggleSortDirection = useCallback(() => {
    const newSortDirection =
      sortDirection === "asc" ? "desc" : sortDirection === "desc" ? "" : "asc";
    dispatch(setSortDirection(newSortDirection));
    dispatch(sortTasks());
  }, [dispatch, sortDirection]);

  const addTaskHandler = useCallback(() => {
    if (
      taskInput.title &&
      taskInput.dueDate &&
      taskInput.status &&
      taskInput.category
    ) {
      const now = new Date().toISOString();
      const newTask = {
        ...taskInput,
        createdDate: now,
        updatedDate: now,
        history: [
          {
            date: now,
            action: "CREATED",
            details: "You created this task",
          },
        ],
      };
      dispatch(addTask(newTask));
      setIsAddingTask(false);
      setTaskInput(INITIAL_TASK);
    }
  }, [dispatch, taskInput]);

  const cancelHandler = useCallback(() => {
    setIsAddingTask(false);
    dispatch(updateTaskStatus({ id: taskInput.id, status: taskInput.status }));
    setTaskInput(INITIAL_TASK);
  }, [dispatch, taskInput]);

  const editOrDelete = useCallback(
    (action: string, task: Task) => {
      if (action.toLowerCase() === "edit") {
        setTaskInput({ ...task });
        setSelectedTask({ ...task });
        setIsAddingTask(true);
      } else if (
        action.toLowerCase() === "delete" &&
        window.confirm("Are you sure you want to delete this task?")
      ) {
        dispatch(deleteTask(task.id));
      }
    },
    [dispatch]
  );

  // Automatically load tasks from dummy data when component mounts
  useEffect(() => {
    dispatch(setTasks(dummyTasks));
  }, [dispatch]);

  return (
    <div className="task-board">
      {/* Column for TO-DO tasks */}
      <div className="board-column todo-column">
        <div className="column-header">
          <h4>To-Do ({categorizedTasks["TO-DO"].length})</h4>
          <button
            className="add-task-btn"
            onClick={() => setIsAddingTask(true)}
          >
            <FaPlus /> Add Task
          </button>
        </div>
        <div className="column-body">
          {isAddingTask && taskInput.status === "TO-DO" && (
            <TaskInputRow
              taskInput={taskInput}
              statuses={statuses}
              categories={categories}
              onAddTask={addTaskHandler}
              onCancel={cancelHandler}
              // Adjust margin if needed for board style
              getMarginBottom={() => "1rem"}
              setTaskInput={setTaskInput}
            />
          )}
          {categorizedTasks["TO-DO"].map((task) => (
            <div key={task.id} className="task-card">
              <div className="card-header">
                <input type="checkbox" className="checkbox" />
                <span className="drag-handle">
                  <FaCircleCheck color="#1B8D17" />
                </span>
                <p
                  className="task-title"
                  onClick={() => setSelectedTask(task)}
                  style={{
                    textDecoration:
                      task.status === "COMPLETED" ? "line-through" : "",
                    cursor: "pointer",
                  }}
                >
                  {task.title}
                </p>
              </div>
              <div className="card-body">
                <p className="due-date">
                  Due: {formatDisplayDate(new Date(task.dueDate))}
                </p>
                <p className="category">Category: {task.category}</p>
              </div>
              <div className="card-footer">
                <CustomSelect
                  options={statuses}
                  selected={task.status}
                  onSelect={(value) =>
                    dispatch(updateTaskStatus({ id: task.id, status: value }))
                  }
                  hideText={true}
                  className="status-select"
                >
                  {task.status}
                </CustomSelect>
                <CustomSelect
                  options={["Edit", "Delete"]}
                  selected=""
                  onSelect={(value: string) => editOrDelete(value, task)}
                  className="options-select"
                  hideText={true}
                >
                  <BsThreeDots style={{ cursor: "pointer" }} />
                </CustomSelect>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column for IN-PROGRESS tasks */}
      <div className="board-column inprogress-column">
        <div className="column-header">
          <h4>In-Progress ({categorizedTasks["IN-PROGRESS"].length})</h4>
          <button onClick={toggleSortDirection} className="sort-btn">
            {sortDirection === "asc"
              ? "Sort ↑"
              : sortDirection === "desc"
              ? "Sort ↓"
              : "Sort"}
          </button>
        </div>
        <div className="column-body">
          {categorizedTasks["IN-PROGRESS"].map((task) => (
            <div key={task.id} className="task-card">
              <div className="card-header">
                <input type="checkbox" className="checkbox" />
                <span className="drag-handle">
                  <FaCircleCheck color="#1B8D17" />
                </span>
                <p
                  className="task-title"
                  onClick={() => setSelectedTask(task)}
                  style={{
                    textDecoration:
                      task.status === "COMPLETED" ? "line-through" : "",
                    cursor: "pointer",
                  }}
                >
                  {task.title}
                </p>
              </div>
              <div className="card-body">
                <p className="due-date">
                  Due: {formatDisplayDate(new Date(task.dueDate))}
                </p>
                <p className="category">Category: {task.category}</p>
              </div>
              <div className="card-footer">
                <CustomSelect
                  options={statuses}
                  selected={task.status}
                  onSelect={(value) =>
                    dispatch(updateTaskStatus({ id: task.id, status: value }))
                  }
                  hideText={true}
                  className="status-select"
                >
                  {task.status}
                </CustomSelect>
                <CustomSelect
                  options={["Edit", "Delete"]}
                  selected=""
                  onSelect={(value: string) => editOrDelete(value, task)}
                  className="options-select"
                  hideText={true}
                >
                  <BsThreeDots style={{ cursor: "pointer" }} />
                </CustomSelect>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column for COMPLETED tasks */}
      <div className="board-column completed-column">
        <div className="column-header">
          <h4>Completed ({categorizedTasks["COMPLETED"].length})</h4>
        </div>
        <div className="column-body">
          {categorizedTasks["COMPLETED"].map((task) => (
            <div key={task.id} className="task-card">
              <div className="card-header">
                <input type="checkbox" className="checkbox" checked readOnly />
                <span className="drag-handle">
                  <FaCircleCheck color="#1B8D17" />
                </span>
                <p
                  className="task-title"
                  onClick={() => setSelectedTask(task)}
                  style={{
                    textDecoration: "line-through",
                    cursor: "pointer",
                  }}
                >
                  {task.title}
                </p>
              </div>
              <div className="card-body">
                <p className="due-date">
                  Due: {formatDisplayDate(new Date(task.dueDate))}
                </p>
                <p className="category">Category: {task.category}</p>
              </div>
              <div className="card-footer">
                <CustomSelect
                  options={statuses}
                  selected={task.status}
                  onSelect={(value) =>
                    dispatch(updateTaskStatus({ id: task.id, status: value }))
                  }
                  hideText={true}
                  className="status-select"
                >
                  {task.status}
                </CustomSelect>
                <CustomSelect
                  options={["Edit", "Delete"]}
                  selected=""
                  onSelect={(value: string) => editOrDelete(value, task)}
                  className="options-select"
                  hideText={true}
                >
                  <BsThreeDots style={{ cursor: "pointer" }} />
                </CustomSelect>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <ViewOrEdit task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
