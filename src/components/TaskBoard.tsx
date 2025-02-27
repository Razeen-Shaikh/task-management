import { useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsThreeDots } from "react-icons/bs";
import { deleteTask } from "../redux/features/taskSlice";
import { Task } from "../api/tasks.data";
import { RootState } from "../redux/store";
import { CustomSelect, ViewOrEdit } from ".";
import { formatDisplayDate } from "../utils/helper";
import "./styles/TaskBoard.css";

export const TaskBoard = () => {
  const dispatch = useDispatch();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { filteredTasks } = useSelector((state: RootState) => state.tasks);

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

  const editOrDelete = useCallback(
    (action: string, task: Task) => {
      if (action.toLowerCase() === "edit") {
        setSelectedTask({ ...task });
      } else if (
        action.toLowerCase() === "delete" &&
        window.confirm("Are you sure you want to delete this task?")
      ) {
        dispatch(deleteTask(task.id));
      }
    },
    [dispatch]
  );

  return (
    <div className="task-board">
      <div className="board-column todo-column">
        <div className="column-header">
          <h4 className="column-title-todo">TO-DO</h4>
        </div>
        <div className="column-body">
          {categorizedTasks["TO-DO"].map((task, index) => (
            <div key={task.id + index} className="task-card">
              <div className="card-header">
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
                <CustomSelect
                  options={["Edit", "Delete"]}
                  selected=""
                  onSelect={(value: string) => editOrDelete(value, task)}
                  className="bs-dots-container"
                  hideText={true}
                  editOrDelete={true}
                >
                  <BsThreeDots style={{ cursor: "pointer" }} />
                </CustomSelect>
              </div>
              <div className="card-body">
                <p className="category">{task.category}</p>
                <p className="due-date">
                  {formatDisplayDate(new Date(task.dueDate))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="board-column inprogress-column">
        <div className="column-header">
          <h4 className="column-title-inprogress">IN-PROGRESS</h4>
        </div>
        <div className="column-body">
          {categorizedTasks["IN-PROGRESS"].map((task, index) => (
            <div key={task.id + index} className="task-card">
              <div className="card-header">
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
                <CustomSelect
                  options={["Edit", "Delete"]}
                  selected=""
                  onSelect={(value: string) => editOrDelete(value, task)}
                  className="bs-dots-container"
                  hideText={true}
                  editOrDelete={true}
                >
                  <BsThreeDots style={{ cursor: "pointer" }} />
                </CustomSelect>
              </div>
              <div className="card-body">
                <p className="category"> {task.category}</p>
                <p className="due-date">
                  {formatDisplayDate(new Date(task.dueDate))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="board-column completed-column">
        <div className="column-header">
          <h4 className="column-title-completed">COMPLETED</h4>
        </div>
        <div className="column-body">
          {categorizedTasks["COMPLETED"].length ? (
            categorizedTasks["COMPLETED"].map((task, index) => (
              <div key={task.id + index} className="task-card">
                <div className="card-header">
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
                  <CustomSelect
                    options={["Edit", "Delete"]}
                    selected=""
                    onSelect={(value: string) => editOrDelete(value, task)}
                    className="bs-dots-container"
                    hideText={true}
                    editOrDelete={true}
                  >
                    <BsThreeDots style={{ cursor: "pointer" }} />
                  </CustomSelect>
                </div>
                <div className="card-body">
                  <p className="category"> {task.category}</p>
                  <p className="due-date">
                    {formatDisplayDate(new Date(task.dueDate))}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center" }}>No Tasks in Completed</p>
          )}
        </div>
      </div>

      {selectedTask && (
        <ViewOrEdit task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
