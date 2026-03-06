import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Car, MapPin, AlertCircle, RefreshCcw } from 'lucide-react';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

function App() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/spots`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setSpots(data);
      setError(null);
    } catch (err) {
      setError("Unable to connect to the backend server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    try {
      const response = await fetch(`${API_BASE}/spots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchSpots();
      }
    } catch (err) {
      alert("Error updating spot status");
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-2">
          <Car size={32} />
          <h1 className="text-2xl font-bold">SmartPark 360 Admin</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <LayoutDashboard /> Dashboard Overview
          </h2>
          <button 
            onClick={fetchSpots}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <div key={spot.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin size={14} className="mr-1" /> Floor 1 • Section A
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    spot.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {spot.status}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => toggleStatus(spot.id, spot.status)}
                    className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Change to {spot.status === 'available' ? 'Occupied' : 'Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-gray-500 border-t bg-white">
        © 2024 SmartPark 360 System • Vercel Managed Deployment
      </footer>
    </div>
  );
}

export default App;
