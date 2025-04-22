import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './official.css';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const API_URL = 'http://localhost:5000/officials';

const OfficialsList = () => {
  const [officials, setOfficials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    position: '',
    rank: 0,
    committee: '',
    term_start: '',
    term_end: '',
    contact_number: '',
    email: '',
    address: '',
    photo_url: ''
  });

  // Positions with their respective ranks (lower number = higher rank)
  const positions = [
    { title: 'Barangay Captain', rank: 1 },
    { title: 'Barangay Secretary', rank: 2 },
    { title: 'Barangay Treasurer', rank: 3 },
    { title: 'Kagawad - Peace and Order', rank: 4 },
    { title: 'Kagawad - Health and Sanitation', rank: 5 },
    { title: 'Kagawad - Education', rank: 6 },
    { title: 'Kagawad - Agriculture', rank: 7 },
    { title: 'Kagawad - Infrastructure', rank: 8 },
    { title: 'Kagawad - Youth and Sports', rank: 9 },
    { title: 'Kagawad - Budget and Appropriations', rank: 10 },
    { title: 'SK Chairperson', rank: 11 },
    { title: 'Barangay Tanod Chief', rank: 12 },
    { title: 'Barangay Tanod', rank: 13 },
    { title: 'Lupon Member', rank: 14 },
    { title: 'Barangay Health Worker', rank: 15 }
  ];

  // Committees
  const committees = [
    'Executive',
    'Peace and Order',
    'Health and Sanitation',
    'Education',
    'Agriculture',
    'Infrastructure',
    'Youth and Sports',
    'Budget and Appropriations',
    'Disaster Risk Reduction and Management',
    'Senior Citizens Affairs',
    'None'
  ];

  // Fetch all officials
  const fetchOfficials = async () => {
    try {
      const response = await axios.get(API_URL);
      setOfficials(response.data);
    } catch (error) {
      console.error('Error fetching officials:', error);
      toast.error('Failed to load officials data');
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If position is changing, update the rank automatically
    if (name === 'position') {
      const selectedPosition = positions.find(pos => pos.title === value);
      setFormData({ 
        ...formData, 
        [name]: value,
        rank: selectedPosition ? selectedPosition.rank : 99
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add new official
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Official added successfully!');
      fetchOfficials();
      resetForm();
    } catch (error) {
      toast.error('Error adding official!');
    }
  };

  // Update existing official
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Official updated successfully!');
      fetchOfficials();
      resetForm();
    } catch (error) {
      toast.error('Error updating official!');
    }
  };

  // Delete official
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this official?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Official deleted successfully!');
        fetchOfficials();
      } catch (error) {
        toast.error('Error deleting official!');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      full_name: '',
      position: '',
      rank: 0,
      committee: '',
      term_start: '',
      term_end: '',
      contact_number: '',
      email: '',
      address: '',
      photo_url: ''
    });
    setIsEditing(false);
    setShowForm(false);
  };

  // Open form for adding
  const handleShowForm = () => {
    setIsEditing(false);
    resetForm();
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (official) => {
    setFormData(official);
    setIsEditing(true);
    setShowForm(true);
  };

  // View official details
  const handleViewDetails = (official) => {
    setSelectedOfficial(official);
    setShowDetails(true);
  };

  // Get top officials for the organization chart (ranks 1-7)
  const topOfficials = officials
    .filter(official => official.rank <= 7)
    .sort((a, b) => a.rank - b.rank);

  // Get other officials
  const otherOfficials = officials
    .filter(official => official.rank > 7)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="officials-container">
      <div className="officials-header">
        <h2>Barangay Officials</h2>
        <button className="add-official-btn" onClick={handleShowForm}>
          <FaPlus /> Add Official
        </button>
      </div>

      {/* Organization Chart */}
      <div className="org-chart-container">
        <h3>Barangay Organizational Structure</h3>
        <div className="org-chart">
          {topOfficials.map((official, index) => {
            // Captain is at the top
            if (official.rank === 1) {
              return (
                <div key={official.id} className="org-box org-captain">
                  <div className="official-photo">
                    <img src={official.photo_url || "/placeholder-official.jpg"} alt={official.full_name} />
                  </div>
                  <div className="official-info">
                    <h4>{official.full_name}</h4>
                    <p>{official.position}</p>
                  </div>
                  <div className="org-actions">
                    <button className="org-btn info-btn" onClick={() => handleViewDetails(official)}>
                      <FaInfoCircle />
                    </button>
                    <button className="org-btn edit-btn" onClick={() => handleEdit(official)}>
                      <FaEdit />
                    </button>
                    <button className="org-btn delete-btn" onClick={() => handleDelete(official.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            }
            // Secretary and Treasurer (rank 2-3) are on the second level
            else if (official.rank <= 3) {
              return (
                <div key={official.id} className="org-box org-executive">
                  <div className="official-photo">
                    <img src={official.photo_url || "/placeholder-official.jpg"} alt={official.full_name} />
                  </div>
                  <div className="official-info">
                    <h4>{official.full_name}</h4>
                    <p>{official.position}</p>
                  </div>
                  <div className="org-actions">
                    <button className="org-btn info-btn" onClick={() => handleViewDetails(official)}>
                      <FaInfoCircle />
                    </button>
                    <button className="org-btn edit-btn" onClick={() => handleEdit(official)}>
                      <FaEdit />
                    </button>
                    <button className="org-btn delete-btn" onClick={() => handleDelete(official.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            }
            // Kagawads (rank 4-7) are on the third level
            else {
              return (
                <div key={official.id} className="org-box org-kagawad">
                  <div className="official-photo">
                    <img src={official.photo_url || "/placeholder-official.jpg"} alt={official.full_name} />
                  </div>
                  <div className="official-info">
                    <h4>{official.full_name}</h4>
                    <p>{official.position}</p>
                  </div>
                  <div className="org-actions">
                    <button className="org-btn info-btn" onClick={() => handleViewDetails(official)}>
                      <FaInfoCircle />
                    </button>
                    <button className="org-btn edit-btn" onClick={() => handleEdit(official)}>
                      <FaEdit />
                    </button>
                    <button className="org-btn delete-btn" onClick={() => handleDelete(official.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Other Officials Table */}
      <div className="other-officials-section">
        <h3>Other Barangay Officials and Staff</h3>
        <div className="table-container">
          <table className="officials-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Position</th>
                <th>Committee</th>
                <th>Term</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {otherOfficials.map((official) => (
                <tr key={official.id}>
                  <td>{official.id}</td>
                  <td>
                    <img 
                      src={official.photo_url || "/placeholder-official.jpg"} 
                      alt={official.full_name} 
                      className="official-thumbnail"
                    />
                  </td>
                  <td>{official.full_name}</td>
                  <td>{official.position}</td>
                  <td>{official.committee}</td>
                  <td>{`${new Date(official.term_start).getFullYear()} - ${new Date(official.term_end).getFullYear()}`}</td>
                  <td>{official.contact_number}</td>
                  <td>
                    <button className="action-btn info-btn" onClick={() => handleViewDetails(official)}>
                      <FaInfoCircle />
                    </button>
                    <button className="action-btn edit-btn" onClick={() => handleEdit(official)}>
                      <FaEdit />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(official.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Official' : 'Add New Official'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Official ID:</label>
                  <input 
                    type="text" 
                    name="id" 
                    value={formData.id} 
                    onChange={handleChange} 
                    required={!isEditing} 
                    disabled={isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Full Name:</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position:</label>
                  <select 
                    name="position" 
                    value={formData.position} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos.rank} value={pos.title}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Committee:</label>
                  <select 
                    name="committee" 
                    value={formData.committee} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select Committee</option>
                    {committees.map(committee => (
                      <option key={committee} value={committee}>
                        {committee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Term Start:</label>
                  <input 
                    type="date" 
                    name="term_start" 
                    value={formData.term_start} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Term End:</label>
                  <input 
                    type="date" 
                    name="term_end" 
                    value={formData.term_end} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input 
                    type="text" 
                    name="contact_number" 
                    value={formData.contact_number} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address:</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Photo URL:</label>
                  <input 
                    type="text" 
                    name="photo_url" 
                    value={formData.photo_url} 
                    onChange={handleChange} 
                    placeholder="https://example.com/photo.jpg" 
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Official' : 'Add Official'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Details Modal */}
      {showDetails && selectedOfficial && (
        <div className="modal-overlay">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h2>Official Details</h2>
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                <MdClose />
              </button>
            </div>
            <div className="official-detail-content">
              <div className="official-profile">
                <div className="profile-photo">
                  <img 
                    src={selectedOfficial.photo_url || "/placeholder-official.jpg"} 
                    alt={selectedOfficial.full_name} 
                  />
                </div>
                <div className="profile-info">
                  <h3>{selectedOfficial.full_name}</h3>
                  <p className="profile-position">{selectedOfficial.position}</p>
                  <p className="profile-committee">Committee: {selectedOfficial.committee}</p>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Personal Information</h4>
                  <div className="detail-item">
                    <strong>ID:</strong>
                    <span>{selectedOfficial.id}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Address:</strong>
                    <span>{selectedOfficial.address}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Term Information</h4>
                  <div className="detail-item">
                    <strong>Term Start:</strong>
                    <span>{new Date(selectedOfficial.term_start).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Term End:</strong>
                    <span>{new Date(selectedOfficial.term_end).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Contact Information</h4>
                  <div className="detail-item">
                    <strong>Contact Number:</strong>
                    <span>{selectedOfficial.contact_number}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{selectedOfficial.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="details-actions">
                <button className="edit-details-btn" onClick={() => {
                  handleEdit(selectedOfficial);
                  setShowDetails(false);
                }}>
                  <FaEdit /> Edit Official
                </button>
                <button className="close-details-btn" onClick={() => setShowDetails(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialsList;