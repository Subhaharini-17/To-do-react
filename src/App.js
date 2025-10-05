import React, { useState, useEffect } from "react";
import "./todo.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    // Load from localStorage on page load
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPastDateModal, setShowPastDateModal] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  // Get today's date in YYYY-MM-DD format for date input min attribute
  const today = new Date().toISOString().split('T')[0];

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add Task
  const addTask = () => {
    if (input.trim() === "") return;
    
    if (dueDate.trim() === "") {
      setShowModal(true);
      return;
    }

    // Check if due date is in the past
    if (dueDate < today) {
      setShowPastDateModal(true);
      return;
    }

    const newTask = {
      text: input,
      due: dueDate,
      completed: false,
      id: Date.now(),
    };
    setTasks([...tasks, newTask]);
    setInput("");
    setDueDate("");
  };

  // Delete One Task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Toggle Completion
  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Clear All Tasks
  const clearAll = () => {
    setShowConfirm(true);
  };

  const confirmYes = () => {
    setTasks([]);
    setShowConfirm(false);
  };

  const confirmNo = () => {
    setShowConfirm(false);
  };

  // Drag-and-drop handlers
  const handleDragStart = (id, e) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleDrop = (id) => {
    const draggedTaskIndex = tasks.findIndex((t) => t.id === draggedId);
    const droppedTaskIndex = tasks.findIndex((t) => t.id === id);
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(draggedTaskIndex, 1);
    updatedTasks.splice(droppedTaskIndex, 0, draggedTask);
    setTasks(updatedTasks);
    setDraggedId(null);
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.due]) acc[task.due] = [];
    acc[task.due].push(task);
    return acc;
  }, {});

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>📅 Tasks by Date</h2>
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Add tasks to see them organized by date</p>
          </div>
        ) : (
          Object.keys(groupedTasks)
            .sort()
            .map((date) => (
              <div key={date} className="date-group">
                <h4>{new Date(date).toLocaleDateString("en-GB")}</h4>
                <ul>
                  {groupedTasks[date].map((task) => (
                    <li 
                      key={task.id} 
                      className={task.completed ? "completed" : ""}
                    >
                      {task.text}
                      {task.completed && (
                        <span className="task-status">Completed</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </div>

      {/* Main Content */}
      <div className="main-container">
        <h1 className="catchy-header">Get Things Done ✔️</h1>

        <div className="input-section">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="taskInput">Task Description</label>
              <input
                type="text"
                id="taskInput"
                placeholder="Enter a task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
            </div>
            <div className="input-group">
              <label htmlFor="dueDateInput">Due Date</label>
              <input
                type="date"
                id="dueDateInput"
                value={dueDate}
                min={today}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="button-row">
            <button className="btn btn-primary" onClick={addTask}>
              ➕ Add Task
            </button>
            <button className="btn btn-secondary" onClick={clearAll}>
              🧹 Clear All
            </button>
          </div>
        </div>

        <div id="taskContainer">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Add a task above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`task-box ${task.completed ? "completed" : ""} ${
                  draggedId === task.id ? "dragging" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(task.id, e)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(task.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="text-container">
                  <span
                    className="complete-circle"
                    onClick={() => toggleComplete(task.id)}
                  ></span>
                  <span className="task-text">{task.text}</span>
                  {task.due && (
                    <span className="due-date">
                      Due: {new Date(task.due).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Confirm Clear-All Dialog */}
        {showConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Clear All Tasks?</h3>
              <p>Are you sure you want to delete all tasks? This action cannot be undone.</p>
              <div className="modal-buttons">
                <button className="btn btn-danger" onClick={confirmYes}>
                  🗑️ Delete All
                </button>
                <button className="btn btn-secondary" onClick={confirmNo}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Missing Date */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Date Required</h3>
              <p>Please select a due date before adding a task.</p>
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Past Date */}
        {showPastDateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Invalid Date</h3>
              <p>Please select a current or future date. Past dates are not allowed.</p>
              <div className="modal-buttons">
                <button className="btn btn-primary" onClick={() => setShowPastDateModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;