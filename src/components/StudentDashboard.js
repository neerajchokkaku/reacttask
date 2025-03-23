import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Home, 
  FileText, 
  MessageSquare, 
  User, 
  Settings, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock as ClockIcon, 
  AlertCircle,
  Filter,
  Trash2
} from "lucide-react";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [studentId, setStudentId] = useState("60d21b4667d0d8992e610c85");
  const [studentData, setStudentData] = useState({ name: "", department: "", year: "" });
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [queriesFilter, setQueriesFilter] = useState("all");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Academic");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingQuery, setIsDeletingQuery] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/students/${studentId}`);
        console.log("User data:", res.data);
  
        setStudentData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    if (studentId) fetchUserData();
  }, [studentId]);
  
  // Fixed version:
const fetchQueries = async () => {
  const userId = localStorage.getItem("userId");
  
  try {
    // Use the userId from localStorage instead of the studentId state variable
    const res = await axios.get(`http://localhost:5000/queries?studentId=${userId}`);
    
    // Set the queries state with the returned data
    setQueries(res.data);
  } catch (error) {
    console.error("Error fetching queries:", error);
  }
};
  useEffect(() => {
    // Fetch queries for home and queries tabs
    if (activeTab === "home" || activeTab === "queries") {
      fetchQueries();
      
      // Set up polling to check for new responses every 30 seconds
      const interval = setInterval(fetchQueries, 30000);
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
        setRefreshInterval(null);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [activeTab]);

  const submitQuery = async () => {
    if (!date || !category || !description) {
      alert("Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:5000/queries", {
        studentId,
        date: new Date(date).toISOString(),
        category,
        description,
        status: "pending"
      });
      console.log("Query submitted successfully:", response.data);
      alert("Query submitted successfully!");
      setDate("");
      setCategory("Academic");
      setDescription("");
      fetchQueries();
    } catch (error) {
      console.error("Error submitting query:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Query submission failed!");
    }
    setIsSubmitting(false);
  };

  // Delete query function
  const deleteQuery = async (queryId, event) => {
    // Stop event propagation to prevent opening the query details
    event.stopPropagation();
    
    // Confirm before deletion
    if (!window.confirm("Are you sure you want to delete this query?")) {
      return;
    }
    
    setIsDeletingQuery(true);
    try {
      await axios.delete(`http://localhost:5000/api/queries/${queryId}`);
      // Remove the deleted query from the state
      setQueries(queries.filter(query => query._id !== queryId));
      alert("Query deleted successfully!");
      // If the deleted query is currently selected, clear the selection
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error("Error deleting query:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete query!");
    }
    setIsDeletingQuery(false);
  };

  // Filter queries based on selected filter
  const filteredQueries = queries.filter(query => {
    if (queriesFilter === "all") return true;
    return query.status.toLowerCase() === queriesFilter.toLowerCase();
  });

  // Get status icon based on query status
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case "answered":
      case "solved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in progress":
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status color classes based on query status
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case "answered":
      case "solved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Manual refresh button handler
  const handleRefresh = () => {
    fetchQueries();
  };

  // Check if a query has responses
  const hasResponses = (query) => {
    return (query.responses && query.responses.length > 0) || query.response;
  };

  // Get the most recent queries
  const getRecentQueries = () => {
    // Create a copy of queries array to avoid mutating the original
    const sortedQueries = [...queries];
    // Sort by date (newest first)
    sortedQueries.sort((a, b) => new Date(b.date) - new Date(a.date));
    // Return the most recent 3
    return sortedQueries.slice(0, 3);
  };

  const renderContent = () => {
    if (activeTab === "new-query") {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Submit a Query</h2>
          <div className="space-y-4">
            <input type="date" className="w-full p-2 border rounded" value={date} onChange={(e) => setDate(e.target.value)} />
            <select className="w-full p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Academic</option>
              <option>Hostel</option>
              <option>Sports</option>
            </select>
            <textarea className="w-full p-2 border rounded" placeholder="Enter your query..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submitQuery} disabled={isSubmitting}>Submit</button>
          </div>
        </div>
      );
    }
    if (activeTab === "queries") {
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Queries</h2>
            <button 
              onClick={handleRefresh} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {/* Filter options */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setQueriesFilter("all")} 
                className={`px-3 py-1 rounded text-sm ${queriesFilter === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
              >
                All
              </button>
              <button 
                onClick={() => setQueriesFilter("pending")} 
                className={`px-3 py-1 rounded text-sm ${queriesFilter === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100"}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setQueriesFilter("answered")} 
                className={`px-3 py-1 rounded text-sm ${queriesFilter === "answered" ? "bg-green-100 text-green-700" : "bg-gray-100"}`}
              >
                Answered
              </button>
              <button 
                onClick={() => setQueriesFilter("rejected")} 
                className={`px-3 py-1 rounded text-sm ${queriesFilter === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100"}`}
              >
                Rejected
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow mt-4">
            {filteredQueries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No queries found.</div>
            ) : (
              <div className="divide-y">
                {filteredQueries.map((query) => (
                  <div key={query._id} className="p-4 hover:bg-gray-50 cursor-pointer relative" onClick={() => setSelectedQuery(query)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{query.category}</h3>
                        <p className="text-sm text-gray-600">{query.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(query.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClass(query.status)}`}>
                        {getStatusIcon(query.status)}
                        {query.status}
                      </div>
                    </div>
                    {hasResponses(query) && (
                      <div className="mt-2 text-xs italic text-gray-500 flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {query.responses ? `${query.responses.length} response(s)` : "Has response"}
                      </div>
                    )}
                    {/* Delete button */}
                    <button 
                      className="absolute top-4 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full"
                      onClick={(e) => deleteQuery(query._id, e)}
                      disabled={isDeletingQuery}
                      title="Delete query"
                    >
                      
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Query details modal */}
          {selectedQuery && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{selectedQuery.category}</h3>
                  <div className="flex items-center gap-2">
                    {/* Delete button in modal */}
                    <button 
                      onClick={(e) => {
                        deleteQuery(selectedQuery._id, e);
                        setSelectedQuery(null);
                      }} 
                      className="text-gray-500 hover:text-red-500"
                      disabled={isDeletingQuery}
                      title="Delete query"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    {/* Close button */}
                    <button 
                      onClick={() => setSelectedQuery(null)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(selectedQuery.status)}`}>
                    {getStatusIcon(selectedQuery.status)}
                    <span className="ml-1">{selectedQuery.status}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{selectedQuery.description}</p>
                <div className="text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted on {new Date(selectedQuery.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Display all responses from the responses array */}
                {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Responses:</h4>
                    <div className="space-y-3">
                      {selectedQuery.responses.map((resp, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-md">
                          <p className="text-gray-700">{resp.response}</p>
                          {resp.respondedBy && resp.respondedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Answered by {resp.respondedBy} on {new Date(resp.respondedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display legacy response if no array responses but there is a legacy response */}
                {(!selectedQuery.responses || selectedQuery.responses.length === 0) && selectedQuery.response && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Response:</h4>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-gray-700">{selectedQuery.response}</p>
                      {selectedQuery.respondedBy && selectedQuery.respondedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Answered by {selectedQuery.respondedBy} on {new Date(selectedQuery.respondedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setSelectedQuery(null)} 
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // New Dashboard Home View
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Queries Stats Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Queries</h3>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-4xl font-bold">{queries.length}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div>Pending: {queries.filter(q => q.status.toLowerCase() === 'pending').length}</div>
              <div>Answered: {queries.filter(q => q.status.toLowerCase() === 'answered' || q.status.toLowerCase() === 'solved').length}</div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Profile</h3>
              <User className="h-6 w-6 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-semibold">{studentData.name || "Loading..."}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div>{"CSE"|| "Department not set"}</div>
              <div>{studentData.year ? `${studentData.year} Year` : "Year not set"}</div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("new-query")} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                New Query
              </button>
              <button 
                onClick={() => setActiveTab("queries")} 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded flex items-center justify-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View My Queries
              </button>
            </div>
          </div>
        </div>

        {/* Recent Queries Section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Recent Queries</h3>
          <div className="bg-white rounded-lg shadow">
            {queries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No queries submitted yet.</div>
            ) : (
              <div className="divide-y">
                {getRecentQueries().map((query) => (
                  <div key={query._id} className="p-4 hover:bg-gray-50 cursor-pointer relative" onClick={() => {
                    setSelectedQuery(query);
                    setActiveTab("queries");
                  }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{query.category}</h3>
                        <p className="text-sm text-gray-600 truncate">{query.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(query.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClass(query.status)}`}>
                        {getStatusIcon(query.status)}
                        {query.status}
                      </div>
                    </div>
                    {/* Delete button in recent queries */}
                    <button 
                      className="absolute top-4 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full"
                      onClick={(e) => deleteQuery(query._id, e)}
                      disabled={isDeletingQuery}
                      title="Delete query"
                    >
                      
                    </button>
                  </div>
                ))}
                {queries.length > 3 && (
                  <div className="p-3 text-center">
                    <button 
                      onClick={() => setActiveTab("queries")} 
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      View all queries
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm p-4 flex justify-between">
        <h1 className="text-xl font-bold text-blue-600">Student Query Portal</h1>
        <div className="text-sm font-medium text-gray-700 flex items-center">
          <User className="h-5 w-5 mr-1" /> {studentData.name}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <div className="w-64 bg-white rounded-lg shadow p-2">
          <nav className="flex flex-col">
            <button onClick={() => setActiveTab("home")} className={`px-3 py-2 rounded-md ${activeTab === "home" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"}`}>
              <Home className="h-5 w-5 mr-2" /> Dashboard
            </button>
            <button onClick={() => setActiveTab("new-query")} className={`px-3 py-2 rounded-md ${activeTab === "new-query" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"}`}>
              <FileText className="h-5 w-5 mr-2" /> New Query
            </button>
            <button onClick={() => setActiveTab("queries")} className={`px-3 py-2 rounded-md ${activeTab === "queries" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"}`}>
              <MessageSquare className="h-5 w-5 mr-2" /> My Queries
            </button>
          </nav>
        </div>
        <div className="flex-1 bg-white rounded-lg shadow">{renderContent()}</div>
      </div>
    </div>
  );
};

export default StudentDashboard;