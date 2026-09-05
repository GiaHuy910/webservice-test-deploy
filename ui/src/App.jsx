import { useState, useEffect } from "react";

// const baseApi = "http://localhost:3001/api";
const baseApi = import.meta.env.VITE_API_URL;
function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });

  const setFieldValue = ({ target: { name, value } }) => {
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    fetch(`${baseApi}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(fields),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(({ token }) => {
        localStorage.setItem("token", token);
      })
      .catch((error) => {
        if (error.status === 401) {
          return setError("Email hoac mat khau khong chinh xac");
        }
        setError("Loi khong xac dinh");
      });
  };
  useEffect(() => {
    fetch(`${baseApi}/auth/me`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.token}`,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((me) => {
        setUser(me);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {user ? (
        <p>Xin chao, {user.name}</p>
      ) : (
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={setFieldValue}
              id="email"
            />
            <br />
            <label htmlFor="password">password</label>
            <br />
            <input
              type="password"
              name="password"
              value={fields.password}
              onChange={setFieldValue}
              id="password"
            />
            <br />
            <button>Login</button>
          </form>
          {!!error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
