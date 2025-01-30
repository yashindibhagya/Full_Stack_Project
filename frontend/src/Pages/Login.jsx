import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory(); 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data.success) {
          // Save the JWT token and user data in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("userData", JSON.stringify(data.user)); // Assuming `data.user` contains user details
  
          console.log("Token and user data saved:", data.token, data.user); // Log the token and user data to the console
  
          // Navigate to the home page or another protected route after successful login
          history.push("/"); 
        } else {
          setError(data.error || "Invalid email or password.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "An error occurred during login.");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btnlogin-primary">
          Login
        </button>
      </form>
      <p className="signup-text">
        Don't have an account?{" "}
        <a href="/signup" className="signup-link">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default Login;
