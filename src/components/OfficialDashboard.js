import { useEffect, useState } from "react";
import axios from "axios";

const OfficialDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [officialName, setOfficialName] = useState("Current Official"); // Ideally this would come from auth

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = () => {
    setLoading(true);
    axios.get("http://localhost:5000/queries")
      .then(response => {
        setQueries(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching queries:", error);
        setLoading(false);
      });
  };

  const handleStatusChange = (queryId, newStatus) => {
    axios.put(`http://localhost:5000/api/queries/${queryId}/status`, { status: newStatus })
      .then(response => {
        setQueries(queries.map(query => 
          query._id === queryId ? { ...query, status: response.data.status } : query
        ));
        if (selectedQuery && selectedQuery._id === queryId) {
          setSelectedQuery({ ...selectedQuery, status: response.data.status });
        }
      })
      .catch(error => console.error("Error updating status:", error));
  };

  const handleSubmitResponse = () => {
    if (!selectedQuery || !selectedQuery._id || !response.trim()) {
      alert("Invalid query selected or response is empty!");
      return;
    }
    
    setSubmitting(true);
    
    // Create the response object
    const responseData = {
      response: response.trim(),
      respondedBy: officialName,
      respondedAt: new Date().toISOString()
    };
    
    // Update both the legacy response field and add to the responses array
    axios.put(`http://localhost:5000/api/queries/${selectedQuery._id}/response`, responseData)
      .then(response => {
        const updatedQuery = response.data;

        setQueries(queries.map(query => 
          query._id === selectedQuery._id ? updatedQuery : query
        ));

        setSelectedQuery(updatedQuery);
        setResponse("");
        setSubmitting(false);
        
        // Also update the status to "Answered"
        handleStatusChange(selectedQuery._id, "Answered");
        
        alert("Response submitted successfully!");
      })
      .catch(error => {
        console.error("Error submitting response:", error);
        setSubmitting(false);
        alert("Error submitting response. Please try again.");
      });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "pending": return "bg-yellow-200";
      case "In Progress": return "bg-blue-200";
      case "Answered": return "bg-green-200";
      case "Closed": return "bg-gray-200";
      case "Rejected": return "bg-red-200";
      default: return "bg-gray-100";
    }
  };

  const filteredQueries = filter === "all" 
    ? queries 
    : queries.filter(query => query.status === filter);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-700 text-white p-4">
        <h1 className="text-2xl font-bold">Official Dashboard</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-100 p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="font-bold mb-2">Filter by Status</h2>
            <select 
              className="w-full p-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Queries</option>
              <option value="pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Answered">Answered</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="mb-4">
            <button 
              className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={fetchQueries}
            >
              Refresh Queries
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <h2 className="text-xl font-bold mb-4">Student Queries</h2>
          
          {loading ? (
            <p>Loading queries...</p>
          ) : filteredQueries.length === 0 ? (
            <p>No queries found.</p>
          ) : (
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 text-left border">Date</th>
                  <th className="p-3 text-left border">Student</th>
                  <th className="p-3 text-left border">Category</th>
                  <th className="p-3 text-left border">Description</th>
                  <th className="p-3 text-left border">Status</th>
                  <th className="p-3 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query) => (
                  <tr key={query._id} className="hover:bg-gray-50">
                    <td className="p-3 border">{new Date(query.date).toLocaleDateString()}</td>
                    <td className="p-3 border">{query.studentId?.name || "Unknown"}</td>
                    <td className="p-3 border">{query.category}</td>
                    <td className="p-3 border">{query.description.substring(0, 50)}...</td>
                    <td className={`p-3 border ${getStatusColor(query.status)}`}>
                      <span className="px-2 py-1 rounded-full text-xs font-bold">
                        {query.status}
                      </span>
                    </td>
                    <td className="p-3 border">
                      <button 
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                        onClick={() => setSelectedQuery(query)}
                      >
                        View
                      </button>
                      <div className="inline-block">
                        <select 
                          className="p-1 text-sm border rounded"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStatusChange(query._id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Change Status</option>
                          <option value="pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Answered">Answered</option>
                          <option value="Closed">Closed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {selectedQuery && (
        <div className="border-t p-4 bg-gray-50">
          <h3 className="text-lg font-bold mb-4">Query Details</h3>
          <p><strong>Student:</strong> {selectedQuery.studentId?.name || "Unknown"}</p>
          <p><strong>Description:</strong> {selectedQuery.description}</p>
          <p><strong>Status:</strong> {selectedQuery.status}</p>
          
          {/* Display previous responses if any */}
          {selectedQuery.responses && selectedQuery.responses.length > 0 && (
            <div className="mt-4 mb-4">
              <h4 className="font-bold">Previous Responses:</h4>
              <div className="max-h-40 overflow-y-auto mt-2">
                {selectedQuery.responses.map((resp, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded mb-2">
                    <p>{resp.response}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By {resp.respondedBy} on {new Date(resp.respondedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h4 className="font-bold mt-4">Your Response:</h4>
          <textarea 
            className="w-full p-2 border rounded mb-2"
            rows="4"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            disabled={submitting}
          ></textarea>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            disabled={!response.trim() || submitting}
            onClick={handleSubmitResponse}
          >
            {submitting ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficialDashboard;