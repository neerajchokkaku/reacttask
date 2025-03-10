import { useEffect, useState } from "react";
import axios from "axios";

const OfficialDashboard = () => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/queries")
      .then(response => setQueries(response.data))
      .catch(error => console.error("Error fetching queries:", error));
  }, []);

  return (
    <div>
      <h2>Student Queries</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Student</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query) => (
            <tr key={query._id}>
              <td>{new Date(query.date).toLocaleDateString()}</td>
              <td>{query.studentId.name}</td>
              <td>{query.category}</td>
              <td>{query.description}</td>
              <td>{query.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OfficialDashboard;
