
import React, { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.DEV ? "http://localhost:5000" : "https://studypulse-zqjh.onrender.com";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");

  // GET TOKEN
  const getToken = () => localStorage.getItem("token");

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = { message: "Server returned non-JSON response" };
      }

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      const userData = {
        name: data.name,
        email: email,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      alert(error.message || "Server connection failed!");
    }
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = { message: "Server returned non-JSON response" };
      }

      if (response.ok) {
        alert("Account created successfully! Please login.");
        setIsSignup(false);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      alert(error.message || "Server connection failed!");
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
  };

  // FETCH USER TASKS
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      } else {
        alert(data.message || "Unable to fetch tasks");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // ADD TASK
  const addTask = async (e) => {
    e.preventDefault();

    if (!task.trim() || !deadline) {
      alert("Enter task and deadline!");
      return;
    }

    try {
      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: task,
          subject: "General",
          deadline: deadline,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTask("");
        setDeadline("");
        fetchTasks();
      } else {
        alert(data.message || "Unable to add task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // COMPLETE TASK
  const completeTask = async (id) => {
    try {
      const response = await fetch(`${API}/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          completed: true,
        }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.message || "Unable to complete task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        fetchTasks();
      } else {
        const data = await response.json();
        alert(data.message || "Unable to delete task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>StudyPulse</h1>
          <p>Stay focused. Achieve more.</p>

          <h2>{isSignup ? "Create Account" : "Welcome Back!"}</h2>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <p>
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <span
              className="switch-login"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? " Login" : " Sign Up"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="app-container">
      <div className="dashboard-header">
        <div>
          <h1>StudyPulse</h1>
          <p>Welcome, {user.name}!</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <p>Stay focused. Complete your goals.</p>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Enter your task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />

        <label>Task Deadline</label>

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <button type="submit">Add Task</button>
      </form>

      <h2>My Tasks</h2>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p>No tasks yet. Add your first task!</p>
        ) : (
          tasks.map((item) => (
            <div className="task-card" key={item._id}>
              <div>
                <h3
                  style={{
                    textDecoration: item.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {item.title}
                </h3>

                <p>
                  Deadline:{" "}
                  {item.deadline
                    ? new Date(item.deadline).toLocaleDateString()
                    : "Not set"}
                </p>

                <p>
                  Status: {item.completed ? "Completed" : "Pending"}
                </p>
              </div>

              <div className="task-buttons">
                {!item.completed && (
                  <button
                    className="complete-btn"
                    onClick={() => completeTask(item._id)}
                  >
                    Completed
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => deleteTask(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
