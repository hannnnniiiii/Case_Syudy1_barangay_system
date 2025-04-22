import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';

const DataVisualization = ({ residents }) => {
  const [activeTab, setActiveTab] = useState('demographics');
  
  // Ensure residents is an array even if it's undefined or null
  const safeResidents = Array.isArray(residents) ? residents : [];
  
  // Prepare data for visualizations
  const demographicsData = React.useMemo(() => {
    if (!safeResidents || safeResidents.length === 0) {
      return {
        genderData: [],
        civilStatusData: [],
        ageData: []
      };
    }
    
    // Gender distribution
    const genderData = [
      { name: 'Male', value: safeResidents.filter(s => s.sex && s.sex.toLowerCase() === 'male').length },
      { name: 'Female', value: safeResidents.filter(s => s.sex && s.sex.toLowerCase() === 'female').length }
    ];
    
    // Civil status distribution
    const civilStatusData = [];
    const civilStatusCounts = {};
    safeResidents.forEach(resident => {
      if (resident.civil_status) {
        civilStatusCounts[resident.civil_status] = (civilStatusCounts[resident.civil_status] || 0) + 1;
      }
    });
    Object.keys(civilStatusCounts).forEach(status => {
      civilStatusData.push({ name: status, value: civilStatusCounts[status] });
    });
    
    // Age distribution
    const ageRanges = {
      '0-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0
    };
    
    safeResidents.forEach(resident => {
      const age = parseInt(resident.age);
      if (isNaN(age)) return;
      
      if (age < 18) ageRanges['0-17']++;
      else if (age < 25) ageRanges['18-24']++;
      else if (age < 35) ageRanges['25-34']++;
      else if (age < 45) ageRanges['35-44']++;
      else if (age < 55) ageRanges['45-54']++;
      else if (age < 65) ageRanges['55-64']++;
      else ageRanges['65+']++;
    });
    
    const ageData = Object.keys(ageRanges).map(range => ({
      name: range,
      value: ageRanges[range]
    }));
    
    return { genderData, civilStatusData, ageData };
  }, [safeResidents]);
  
  const educationData = React.useMemo(() => {
    if (!safeResidents || safeResidents.length === 0) {
      return [];
    }
    
    const educationCounts = {};
    safeResidents.forEach(resident => {
      if (resident.educational_attainment) {
        educationCounts[resident.educational_attainment] = (educationCounts[resident.educational_attainment] || 0) + 1;
      }
    });
    
    return Object.keys(educationCounts).map(level => ({
      name: level,
      value: educationCounts[level]
    }));
  }, [safeResidents]);
  
  const purokData = React.useMemo(() => {
    if (!safeResidents || safeResidents.length === 0) {
      return [];
    }
    
    const purokCounts = {};
    safeResidents.forEach(resident => {
      if (resident.purok) {
        purokCounts[resident.purok] = (purokCounts[resident.purok] || 0) + 1;
      }
    });
    
    return Object.keys(purokCounts).map(purok => ({
      name: purok,
      value: purokCounts[purok]
    }));
  }, [safeResidents]);
  
  const occupationData = React.useMemo(() => {
    if (!safeResidents || safeResidents.length === 0) {
      return [];
    }
    
    // Get top 10 occupations
    const occupationCounts = {};
    safeResidents.forEach(resident => {
      if (resident.occupation) {
        occupationCounts[resident.occupation] = (occupationCounts[resident.occupation] || 0) + 1;
      }
    });
    
    return Object.entries(occupationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [safeResidents]);
  
  // COLORS for charts
  const COLORS = ['#8b0000', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#e91e63', '#795548', '#607d8b', '#00bcd4', '#ffeb3b'];
  
  // Check if any data is available for rendering
  const hasData = safeResidents.length > 0;
  
  if (!hasData) {
    return (
      <div className="data-visualization">
        <div className="chart-tabs">
          <button className="chart-tab active">
            <FaChartPie /> Demographics
          </button>
          <button className="chart-tab">
            <FaChartBar /> Education
          </button>
          <button className="chart-tab">
            <FaChartLine /> Purok Distribution
          </button>
          <button className="chart-tab">
            <FaChartBar /> Occupation
          </button>
        </div>
        <div className="chart-content" style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading data or no data available for visualization...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="data-visualization">
      <div className="chart-tabs">
        <button 
          className={`chart-tab ${activeTab === 'demographics' ? 'active' : ''}`}
          onClick={() => setActiveTab('demographics')}
        >
          <FaChartPie /> Demographics
        </button>
        <button 
          className={`chart-tab ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          <FaChartBar /> Education
        </button>
        <button 
          className={`chart-tab ${activeTab === 'purok' ? 'active' : ''}`}
          onClick={() => setActiveTab('purok')}
        >
          <FaChartLine /> Purok Distribution
        </button>
        <button 
          className={`chart-tab ${activeTab === 'occupation' ? 'active' : ''}`}
          onClick={() => setActiveTab('occupation')}
        >
          <FaChartBar /> Occupation
        </button>
      </div>
      
      <div className="chart-content">
        {activeTab === 'demographics' && (
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicsData.genderData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(demographicsData.genderData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2196f3' : '#e91e63'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <h3>Civil Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographicsData.civilStatusData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(demographicsData.civilStatusData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <h3>Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={demographicsData.ageData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b0000" name="Number of Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'education' && (
          <div className="chart-grid">
            <div className="chart-card full-width">
              <h3>Educational Attainment</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={educationData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b0000" name="Number of Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'purok' && (
          <div className="chart-grid">
            <div className="chart-card">
              <h3>Purok Population Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={purokData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b0000" name="Number of Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <h3>Purok Population Distribution (Pie)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={purokData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(purokData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === 'occupation' && (
          <div className="chart-grid">
            <div className="chart-card full-width">
              <h3>Top 10 Occupations</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={occupationData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b0000" name="Number of Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualization;