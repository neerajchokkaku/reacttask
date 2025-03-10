import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

const StudentDashboard = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const studentId = "12345"; // Replace with logged-in student ID

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = dateString === date;
      const isToday = 
        i === currentDate.getDate() && 
        currentMonth === currentDate.getMonth() && 
        currentYear === currentDate.getFullYear();
      
      days.push(
        <div 
          key={i} 
          onClick={() => {
            setDate(dateString);
            setShowCalendar(false);
          }}
          className={`flex items-center justify-center h-8 w-8 rounded-full cursor-pointer text-sm
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${isToday && !isSelected ? 'border border-blue-400' : ''}
            ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
          `}
        >
          {i}
        </div>
      );
    }
    
    return days;
  };
  
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };
  
  const submitQuery = async () => {
    if (!date || !category || !description) {
      alert("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call (replace with axios call in production)
      await new Promise(resolve => setTimeout(resolve, 800));
      // await axios.post("http://localhost:5000/queries", {
      //   studentId, date, category, description
      // });
      alert("Query submitted successfully!");
      setDate("");
      setCategory("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Your Query</h2>
      
      {/* Date Picker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <div className="relative">
          <div 
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center justify-between w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <span className={date ? "text-gray-800" : "text-gray-400"}>
              {date ? formatDisplayDate(date) : "Select a date"}
            </span>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {showCalendar && (
            <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  &lt;
                </button>
                <span className="font-medium">
                  {months[currentMonth]} {currentYear}
                </span>
                <button 
                  onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required
        >
          <option value="">Select Category</option>
          <option value="Academic">Academic</option>
          <option value="Hostel">Hostel</option>
          <option value="Sports">Sports</option>
        </select>
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="Describe your problem..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          required
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <button 
        onClick={submitQuery}
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-md text-white font-medium 
          ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
          transition-colors duration-200 flex items-center justify-center`}
      >
        {isSubmitting ? (
          <>
            <Clock className="animate-spin h-4 w-4 mr-2" />
            Submitting...
          </>
        ) : 'Submit Query'}
      </button>
    </div>
  );
};

export default StudentDashboard;