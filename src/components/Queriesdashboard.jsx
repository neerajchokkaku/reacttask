import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, RefreshCw } from "lucide-react";

const QueriesDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, resolved
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/queries");
      setQueries(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching queries:", err);
      setError("Failed to load queries. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQueries();
  }, []);
  
  const handleStatusChange = async (queryId, newStatus) => {
    try {
      // Assuming you have an endpoint to update query status
      await axios.patch(`http://localhost:5000/queries/${queryId}`, {
        status: newStatus
      });
      
      // Update local state
      setQueries(queries.map(query => 
        query._id === queryId ? { ...query, status: newStatus } : query
      ));
    } catch (error) {
      console.error("Error updating query status:", error);
      alert("Failed to update query status");
    }
  };
  
  const getFilteredQueries = () => {
    return queries.filter(query => {
      // Apply status filter
      if (filter !== "all" && query.status !== filter) return false;
      
      // Apply search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          query.description.toLowerCase().includes(searchLower) ||
          query.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Queries Dashboard</h1>
        <button 
          onClick={fetchQueries}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Queries</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && <div className="text-center py-8">Loading queries...</div>}
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Queries Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredQueries().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No queries found
                    </td>
                  </tr>
                ) : (
                  getFilteredQueries().map((query) => (
                    <tr key={query._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(query.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${query.category === 'Academic' ? 'bg-green-100 text-green-800' : 
                            query.category === 'Hostel' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {query.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {query.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${query.status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {query.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {query.status === 'pending' ? (
                          <button
                            onClick={() => handleStatusChange(query._id, 'resolved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(query._id, 'pending')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {getFilteredQueries().length} of {queries.length} total queries
          </div>
        </>
      )}
    </div>
  );
};

export default QueriesDashboard;