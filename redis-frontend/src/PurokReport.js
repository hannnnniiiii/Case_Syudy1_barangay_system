import React, { useState, useEffect, useRef } from 'react';
import {FaChartBar, FaChartPie, FaSearch, FaMale, FaFemale, FaPrint} from 'react-icons/fa';
import {BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import './PurokReport.css';

const PurokStatistics = ({ residents }) => {
  const [purokData, setPurokData] = useState([]);
  const [filteredPurokData, setFilteredPurokData] = useState([]);
  const [selectedPurok, setSelectedPurok] = useState(null);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  

  // Education level ordering for consistent display
  const educationOrder = ['None', 'Elementary', 'High School', 'Vocational', 'College', 'Post Graduate'];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    if (residents && residents.length > 0) {
      processPurokData();
    }
  }, [residents]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = purokData.filter(p => 
        p.purok.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPurokData(filtered);
    } else {
      setFilteredPurokData(purokData);
    }
  }, [searchTerm, purokData]);

  const processPurokData = () => {
    // Group residents by Purok
    const purokGroups = residents.reduce((acc, resident) => {
      const purok = resident.purok || 'Unassigned';
      
      if (!acc[purok]) {
        acc[purok] = {
          total: 0,
          male: 0,
          female: 0,
          educationBreakdown: {},
          educationDetails: {}
        };
      }
      
      // Total and sex count
      acc[purok].total++;
      acc[purok][resident.sex.toLowerCase()]++;
      
      // Education breakdown
      const education = resident.educational_attainment || 'None';
      if (!acc[purok].educationBreakdown[education]) {
        acc[purok].educationBreakdown[education] = {
          total: 0,
          male: 0,
          female: 0
        };
        acc[purok].educationDetails[education] = [];
      }
      
      acc[purok].educationBreakdown[education].total++;
      acc[purok].educationBreakdown[education][resident.sex.toLowerCase()]++;
      
      // Store individual resident details
      acc[purok].educationDetails[education].push(resident);
      
      return acc;
    }, {});

    // Transform data for easier visualization
    const purokDataArray = Object.entries(purokGroups).map(([purok, data]) => ({
      purok,
      total: data.total,
      male: data.male,
      female: data.female,
      educationBreakdown: Object.entries(data.educationBreakdown).map(([education, breakdown]) => ({
        education,
        total: breakdown.total,
        male: breakdown.male,
        female: breakdown.female
      })),
      educationDetails: data.educationDetails
    }));

    setPurokData(purokDataArray);
    setFilteredPurokData(purokDataArray);
  };

  const renderResidentsTable = (residents) => {
    return (
      <div className="residents-table-container">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Educational Attainment</th>
              <th>Occupation</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident, index) => (
              <tr key={index}>
                <td>{resident.full_name || 'N/A' }</td>
                <td>{resident.age || 'N/A'}</td>
                <td>{resident.sex || 'N/A'}</td>
                <td>{resident.educational_attainment || 'None'}</td>
                <td>{resident.occupation || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPurokDetails = (purok) => {
    return (
      <div className="purok-details-modal">
        <h2>{purok.purok} Purok Details</h2>
        <div className="purok-summary">
          <div className="summary-card">
            <h3>Total Residents</h3>
            <p>{purok.total}</p>
          </div>
          <div className="summary-card">
            <h3>Male Residents</h3>
            <p>{purok.male}</p>
          </div>
          <div className="summary-card">
            <h3>Female Residents</h3>
            <p>{purok.female}</p>
          </div>
        </div>

        <h3>Education Breakdown</h3>
        <div className="education-breakdown">
          {purok.educationBreakdown.map((edu, index) => (
            <div 
              key={index} 
              className={`education-card ${selectedEducation === edu.education ? 'selected' : ''}`}
              onClick={() => setSelectedEducation(selectedEducation === edu.education ? null : edu.education)}
            >
              <h4>{edu.education}</h4>
              <div className="education-stats">
                <p>Total: {edu.total}</p>
                <p>Male: {edu.male}</p>
                <p>Female: {edu.female}</p>
                <button className="view-residents-btn">
                  {selectedEducation === edu.education ? "Hide Residents" : "View Residents"}
                </button>
              </div>
              
              {selectedEducation === edu.education && purok.educationDetails[edu.education] && 
                renderResidentsTable(purok.educationDetails[edu.education])
              }
            </div>
          ))}
        </div>
        
        <h3>All Residents</h3>
        {renderResidentsTable(
          Object.values(purok.educationDetails).flat()
        )}
      </div>
    );
  };

  // Print specific purok function
  const printPurokDetails = (purok) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; }
        h1, h2, h3 { color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .summary-container { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .summary-box { border: 1px solid #ddd; padding: 10px; text-align: center; width: 30%; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      </style>
      <div class="header">
        <h1>${purok.purok} Purok Demographics Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <h2>Population Summary</h2>
      <div class="summary-container">
        <div class="summary-box">
          <h3>Total Residents</h3>
          <p>${purok.total}</p>
        </div>
        <div class="summary-box">
          <h3>Male</h3>
          <p>${purok.male}</p>
        </div>
        <div class="summary-box">
          <h3>Female</h3>
          <p>${purok.female}</p>
        </div>
      </div>
      
      <h2>Educational Attainment</h2>
      <table>
        <thead>
          <tr>
            <th>Education Level</th>
            <th>Total</th>
            <th>Male</th>
            <th>Female</th>
          </tr>
        </thead>
        <tbody>
          ${purok.educationBreakdown.map(edu => `
            <tr>
              <td>${edu.education}</td>
              <td>${edu.total}</td>
              <td>${edu.male}</td>
              <td>${edu.female}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h2>Resident List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Education</th>
            <th>Occupation</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(purok.educationDetails).flat().map(resident => `
            <tr>
              <td>${resident.full_name || 'N/A'}</td>
              <td>${resident.age || 'N/A'}</td>
              <td>${resident.sex || 'N/A'}</td>
              <td>${resident.educational_attainment || 'None'}</td>
              <td>${resident.occupation || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Barangay Information System - ${purok.purok} Demographics Report</p>
      </div>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Add small delay before printing to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  // Print all puroks distribution
  const printAllDistribution = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; }
        h1, h2, h3 { color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .purok-summary { margin-bottom: 30px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        .education-table { margin-bottom: 40px; }
        @media print {
          body { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          .page-break { page-break-before: always; }
        }
      </style>
      <div class="header">
        <h1>Purok Demographics Distribution Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <h2>Overall Purok Distribution</h2>
      <table>
        <thead>
          <tr>
            <th>Purok</th>
            <th>Total Residents</th>
            <th>Male</th>
            <th>Female</th>
          </tr>
        </thead>
        <tbody>
          ${purokData.map(purok => `
            <tr>
              <td>${purok.purok}</td>
              <td>${purok.total}</td>
              <td>${purok.male}</td>
              <td>${purok.female}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td>Total</td>
            <td>${purokData.reduce((sum, purok) => sum + purok.total, 0)}</td>
            <td>${purokData.reduce((sum, purok) => sum + purok.male, 0)}</td>
            <td>${purokData.reduce((sum, purok) => sum + purok.female, 0)}</td>
          </tr>
        </tbody>
      </table>
      
      ${purokData.map((purok, index) => `
        ${index > 0 ? '<div class="page-break"></div>' : ''}
        <div class="purok-summary">
          <h2>${purok.purok} Purok Educational Breakdown</h2>
          <table class="education-table">
            <thead>
              <tr>
                <th>Education Level</th>
                <th>Total</th>
                <th>Male</th>
                <th>Female</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${purok.educationBreakdown.map(edu => `
                <tr>
                  <td>${edu.education}</td>
                  <td>${edu.total}</td>
                  <td>${edu.male}</td>
                  <td>${edu.female}</td>
                  <td>${(edu.total / purok.total * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      
      <div class="footer">
        <p>Barangay Information System - Demographics Distribution Report</p>
      </div>
    `;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Add small delay before printing to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="education-statistics">
      <div className="content-header">
        <h2>Purok Demographics</h2>
        <div className="filter-controls">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search Purok" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="print-all-btn"
            onClick={printAllDistribution}
            title="Print All Distribution"
          >
            <FaPrint /> Print All Distribution
          </button>
        </div>
      </div>

      <h3 className="section-title">Purok Overview</h3>
      
      <div className="charts-container">
        {/* Sex Distribution Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Sex Distribution Across Puroks</h3>
            <FaChartBar className="chart-icon" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={purokData} 
              layout="vertical"
              margin={{ left: 20, right: 10, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="purok" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="male" stackId="a" fill="#3182bd" name="Male" />
              <Bar dataKey="female" stackId="a" fill="#de2d26" name="Female" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Purok Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Purok Distribution</h3>
            <FaChartPie className="chart-icon" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={purokData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                label={({ purok, percent }) => `${purok}: ${(percent * 100).toFixed(1)}%`}
              >
                {purokData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} residents (${props.payload.payload.male} M, ${props.payload.payload.female} F)`, 
                  props.payload.payload.purok
                ]} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Purok Section with Search Filtering */}
      <h3 className="section-title">Purok Details</h3>
      <div className="charts-container">
        {filteredPurokData.map((purok, index) => (
          <div 
            key={index} 
            className="chart-card purok-card" 
          >
            <div className="chart-header">
              <h3>{purok.purok}</h3>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaMale style={{ color: '#3182bd', marginRight: 10 }} />
                {purok.male}
                <FaFemale style={{ color: '#de2d26', marginLeft: 10, marginRight: 10 }} />
                {purok.female}
                <button 
                  className="print-btn"
                  onClick={() => printPurokDetails(purok)}
                  title="Print Purok Details"
                >
                  <FaPrint />
                </button>
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedPurok(purok)}
                >
                  View Details
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={purok.educationBreakdown} 
                layout="vertical"
                margin={{ left: 20, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="education" type="category" />
                <Tooltip />
                <Bar dataKey="male" stackId="a" fill="#3182bd" name="Male" />
                <Bar dataKey="female" stackId="a" fill="#de2d26" name="Female" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Purok Details Modal */}
      {selectedPurok && (
        <div className="modal-overlay" onClick={() => setSelectedPurok(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedPurok.purok} Purok Details</h2>
              <button 
                className="print-modal-btn"
                onClick={() => printPurokDetails(selectedPurok)}
                title="Print Purok Details"
              >
                <FaPrint /> Print Details
              </button>
            </div>
            {renderPurokDetails(selectedPurok)}
            <button 
              onClick={() => setSelectedPurok(null)} 
              className="close-modal-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Key Insights Section */}
      <div className="insights-section">
        <h3 className="section-title">Key Insights</h3>
        <div className="insights-container">
          <div className="insight-card">
            <h4>Population Distribution</h4>
            <p>Analysis of residents across different Puroks, highlighting variations in population size and gender composition.</p>
          </div>
          <div className="insight-card">
            <h4>Educational Diversity</h4>
            <p>Comparative view of educational attainment within each Purok, showing the distribution of education levels by gender.</p>
          </div>
          <div className="insight-card">
            <h4>Demographic Patterns</h4>
            <p>Identifying unique demographic characteristics of each Purok through comprehensive data visualization.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurokStatistics;