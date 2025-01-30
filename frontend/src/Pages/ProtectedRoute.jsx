import React, { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetch("http://localhost:5000/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error accessing protected route:", error));
  }, []);

  return (
    <div>
      <h2>Protected Route</h2>
      {data ? <p>{data.message}</p> : <p>Loading...</p>}
    </div>
  );
};

export default ProtectedRoute;
