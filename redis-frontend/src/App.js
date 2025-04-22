import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUsers, FaHome, FaGraduationCap, FaInfoCircle, FaFileAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import DataVisualization from './visual';
import './visual.css';
import PurokDistributions from './PurokReport';
import OfficialsList from './official';
import Home from './home';  
import CSVUpload from './upload';
import DocumentGenerator from './DocumentGenerator';

const API_URL = 'http://localhost:5000/residents';

function ResidentManagement() {
  const [formData, setFormData] = useState({
    id: '',full_name: '', sex: '', dob: '', age: '', purok: '', contact_number: '', civil_status: '', occupation: '', educational_attainment: '',religion: ''
  });
  const [residents, setResidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('full_name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Statistics
  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    purokStats: {}
  });

  // Fetch all residents
  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      setResidents(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to load residents data');
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const maleCount = data.filter(resident => resident.sex.toLowerCase() === 'male').length;
    const femaleCount = data.filter(resident => resident.sex.toLowerCase() === 'female').length;
 
    // Purok statistics
    const purokStats = {};
    data.forEach(resident => {
      if (resident.purok) {
        purokStats[resident.purok] = (purokStats[resident.purok] || 0) + 1;
      }
    });
 
    setStats({
      totalResidents: data.length,
      maleCount,
      femaleCount,
      purokStats
    });
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
 
    // Auto-calculate age from date of birth
    if (e.target.name === 'dob') {
      const birthDate = new Date(e.target.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
   
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
   
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  // Add new resident
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Resident added successfully!');
      fetchResidents();
      resetForm();
    } catch (error) {
      toast.error('Error adding resident!');
    }
  };

  // Update existing resident
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Resident updated successfully!');
      fetchResidents();
      resetForm();
    } catch (error) {
      toast.error('Error updating resident!');
    }
  };

  // Delete resident
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resident?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Resident deleted!');
        fetchResidents();
      } catch (error) {
        toast.error('Error deleting resident!');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '', full_name: '', sex: '', dob: '', age: '', purok: '', contact_number: '', civil_status: '', occupation: '', educational_attainment: '',religion: ''});
    setIsEditing(false);
    setShowForm(false);
  };

  // Open form for adding a new resident
  const handleShowForm = () => {
    setIsEditing(false);
    resetForm();
    setShowForm(true);
  };

  // Open form for editing a resident
  const handleEdit = (resident) => {
    setFormData(resident);
    setIsEditing(true);
    setShowForm(true);
  };

  // View resident details
  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
    setShowDetails(true);
  };

  // Generate document for a resident
  const handleGenerateDocument = (residentId) => {
    navigate(`/document/${residentId}`);
  };

  // Filter residents based on search query and selected filter
  const filteredResidents = residents.filter((resident) => {
    if (!searchQuery) return true;
    const value = resident[filterBy]?.toString().toLowerCase();
    return value && value.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="content-header">
        <h2>Resident Management</h2>
        <div className="header-actions">
          <button className="add-btn" onClick={handleShowForm}>
            <FaUserPlus />
            <span>Add Resident</span>
          </button>
          <CSVUpload onImportSuccess={fetchResidents} />
        </div>
      </div>
      <div className="search-filter">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={`Search by ${filterBy}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
          <option value="full_name">Name</option>
          <option value="age">Age</option>
          <option value="civil_status">Civil Status</option>
          <option value="occupation">Occupation</option>
          <option value="educational_attainment">Educational Attainment</option>
        </select>
      </div>

      {/* Simplified Resident Table */}
      <div className="table-container">
        <table className="resident-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Civil Status</th>
              <th>Occupation</th>
              <th>Educational Attainment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems
              .sort((a, b) => a.id - b.id)
              .map((resident) => (
                <tr key={resident.id} onClick={() => handleViewDetails(resident)} className="clickable-row">
                  <td>{resident.id}</td>
                  <td>{resident.full_name}</td>
                  <td>{resident.age}</td>
                  <td>{resident.civil_status}</td>
                  <td>{resident.occupation}</td>
                  <td>{resident.educational_attainment}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="action-btn info-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(resident);
                    }}>
                      <FaInfoCircle />
                    </button>
                    <button className="action-btn edit-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(resident);
                    }}>
                      <FaEdit />
                    </button>
                    <button className="action-btn delete-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(resident.id);
                    }}>
                      <FaTrash />
                    </button>
                    <button className="action-btn doc-btn" onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateDocument(resident.id);
                    }}>
                      <FaFileAlt />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Prev
          </button>
          {[...Array(totalPages).keys()].map(number => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
            >
              {number + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Resident' : 'Add New Resident'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Resident ID:</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange} required={!isEditing} disabled={isEditing} />
                </div>
                <div className="form-group">
                  <label>Full Name:</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
              </div>
         
              <div className="form-row">
                <div className="form-group">
                  <label>Sex:</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Age:</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purok:</label>
                  <select name="purok" value={formData.purok} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Adelfa">Adelfa</option>
                    <option value="Anthurium">Anthurium</option>
                    <option value="Garcia">Garcia</option>
                    <option value="Gumamela">Gumamela</option>
                    <option value="Pag-asa">Pag-asa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Civil Status:</label>
                  <select name="civil_status" value={formData.civil_status} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Occupation:</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Educational Attainment:</label>
                  <select name="educational_attainment" value={formData.educational_attainment} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Elementary Graduate">Elementary Graduate</option>
                    <option value="High School Undergraduate">High School Undergraduate</option>
                    <option value="High School Graduate">High School Graduate</option>
                    <option value="Vocational Graduate">Vocational Graduate</option>
                    <option value="College Undergraduate">College Undergraduate</option>
                    <option value="College Graduate">College Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Religion:</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Resident' : 'Add Resident'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resident Details Modal */}
      {showDetails && selectedResident && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Resident Details</h2>
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                <MdClose />
              </button>
            </div>
            <div className="resident-details">
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>ID:</strong>
                    <span>{selectedResident.id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Full Name:</strong>
                    <span>{selectedResident.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Sex:</strong>
                    <span>{selectedResident.sex}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Date of Birth:</strong>
                    <span>{selectedResident.dob}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Age:</strong>
                    <span>{selectedResident.age}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Civil Status:</strong>
                    <span>{selectedResident.civil_status}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Religion:</strong>
                    <span>{selectedResident.religion}</span>
                  </div>
                </div>
              </div>
           
              <div className="details-section">
                <h3>Contact & Location</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Purok:</strong>
                    <span>{selectedResident.purok}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Contact Number:</strong>
                    <span>{selectedResident.contact_number}</span>
                  </div>
                </div>
              </div>
           
              <div className="details-section">
                <h3>Professional Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Occupation:</strong>
                    <span>{selectedResident.occupation}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Educational Attainment:</strong>
                    <span>{selectedResident.educational_attainment}</span>
                  </div>
                </div>
              </div>
           
              <div className="details-actions">
                <button className="edit-details-btn" onClick={() => {
                  handleEdit(selectedResident);
                  setShowDetails(false);
                }}>
                  <FaEdit /> Edit Resident
                </button>
                <button className="generate-doc-btn" onClick={() => {
                  handleGenerateDocument(selectedResident.id);
                  setShowDetails(false);
                }}>
                  <FaFileAlt /> Generate Document
                </button>
                <button className="close-details-btn" onClick={() => setShowDetails(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DataVisualization residents={residents} />
    </>
  );
}

function App() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    maleCount: 0,
    femaleCount: 0,
    purokStats: {}
  });
  const [residents, setResidents] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');

  // Fetch all residents for stats
  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      setResidents(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Failed to load residents data');
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const maleCount = data.filter(resident => resident.sex.toLowerCase() === 'male').length;
    const femaleCount = data.filter(resident => resident.sex.toLowerCase() === 'female').length;
 
    // Purok statistics
    const purokStats = {};
    data.forEach(resident => {
      if (resident.purok) {
        purokStats[resident.purok] = (purokStats[resident.purok] || 0) + 1;
      }
    });
 
    setStats({
      totalResidents: data.length,
      maleCount,
      femaleCount,
      purokStats
    });
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-header">
            <img src="/images.jpg" alt="Barangay Logo" className="sidebar-logo" />
            <h2>Barangay Mahayahay</h2>
          </div>
          <ul className="sidebar-menu">
            <li className={activePage === 'dashboard' ? 'active' : ''}>
              <Link to="/" onClick={() => setActivePage('dashboard')}>
                <FaHome className="menu-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={activePage === 'residents' ? 'active' : ''}>
              <Link to="/residents" onClick={() => setActivePage('residents')}>
                <FaUsers className="menu-icon" />
                <span>Residents</span>
              </Link>
            </li>
            <li className={activePage === 'officials' ? 'active' : ''}>
              <Link to="/officials" onClick={() => setActivePage('officials')}>
                <FaGraduationCap className="menu-icon" />
                <span>Barangay Officials</span>
              </Link>
            </li>
            <li className={activePage === 'education' ? 'active' : ''}>
              <Link to="/education" onClick={() => setActivePage('education')}>
                <FaGraduationCap className="menu-icon" />
                <span>Purok Demographics</span>
              </Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <header className="dashboard-header">
            <h1>Barangay Mahayahay Profiling System</h1>
            <div className="user-info">
              <span>Admin</span>
              <img src="hanifa.jpg" alt="Admin" className="user-avatar" />
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Home stats={stats} />} />
            <Route path="/residents" element={<ResidentManagement />} />
            <Route path="/officials" element={<OfficialsList />} />
            <Route path="/education" element={<PurokDistributions residents={residents} />} />
            <Route path="/document/:id" element={<DocumentGenerator />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick />
      </div>
    </Router>
  );
}

export default App;