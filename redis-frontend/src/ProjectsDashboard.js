import React, { useState, useEffect } from 'react';
import { FaProjectDiagram, FaCheck, FaHourglass, FaCalendarAlt, FaMoneyBillWave, FaPlus, FaChartLine, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './ProjectsDashboard.css';

const ProjectsDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const emptyProject = {
    title: '',
    description: '',
    status: 'Planned',
    start_date: '',
    end_date: '',
    budget: '',
    location: '',
    beneficiaries: ''
  };
  const [newProject, setNewProject] = useState(emptyProject);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/projects');
      
      // Add progress calculation to each project
      const projectsWithProgress = response.data.map(project => ({
        ...project,
        progress: calculateProgress(project)
      }));
      
      setProjects(projectsWithProgress);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Could not load projects. Please try again later.');
      setLoading(false);
    }
  };

  const calculateProgress = (project) => {
    // If project is completed, it's 100%
    if (project.status?.toLowerCase() === 'completed') {
      return 100;
    }
    
    // If project is still in planning phase, it's 0%
    if (project.status?.toLowerCase() === 'planned') {
      return 0;
    }

    // For in-progress projects, calculate based on dates
    if (project.start_date && project.end_date) {
      const startDate = new Date(project.start_date);
      const endDate = new Date(project.end_date);
      const today = new Date();
      
      // If project hasn't started yet
      if (today < startDate) {
        return 0;
      }
      
      // If project end date has passed but status is not completed
      if (today > endDate) {
        return 90; // Cap at 90% if end date passed but not marked completed
      }
      
      // Calculate percentage based on time elapsed
      const totalDuration = endDate - startDate;
      const elapsedDuration = today - startDate;
      const rawProgress = (elapsedDuration / totalDuration) * 100;
      
      // Round to nearest whole number and ensure between 0-100
      return Math.min(Math.max(Math.round(rawProgress), 0), 100);
    }
    
    // If only start date is available, base progress on time since start
    if (project.start_date && !project.end_date) {
      const startDate = new Date(project.start_date);
      const today = new Date();
      
      // If project hasn't started yet
      if (today < startDate) {
        return 0;
      }
      
      // Assume standard 3-month project duration if no end date
      const assumedDuration = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
      const elapsedTime = today - startDate;
      const rawProgress = (elapsedTime / assumedDuration) * 100;
      
      // Cap at 80% for projects with no end date
      return Math.min(Math.max(Math.round(rawProgress), 0), 80);
    }
    
    // Default case - no dates, in progress
    return 50;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: name === 'budget' ? (value === '' ? '' : Number(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      if (editMode) {
        await axios.put(`http://localhost:5000/projects/${newProject.id}`, newProject);
      } else {
        await axios.post('http://localhost:5000/projects', newProject);
      }
      
      // Reset form and fetch updated projects
      setNewProject(emptyProject);
      setShowForm(false);
      setEditMode(false);
      fetchProjects();
    } catch (err) {
      console.error(`Error ${editMode ? 'updating' : 'adding'} project:`, err);
      setError(`Failed to ${editMode ? 'update' : 'add'} project. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project) => {
    // Ensure dates are formatted as YYYY-MM-DD for form inputs
    const formattedProject = {
      ...project,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''
    };
    
    setNewProject(formattedProject);
    setEditMode(true);
    setShowForm(true);
    setShowModal(false); // Close modal if open
  };

  const handleDelete = async (id) => {
    if (!deleteConfirm) {
      setDeleteConfirm(id);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/projects/${id}`);
      fetchProjects();
      setDeleteConfirm(false);
      setShowModal(false); // Close modal if open
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setShowModal(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <FaCheck className="status-icon completed" />;
      case 'in progress':
        return <FaHourglass className="status-icon in-progress" />;
      default:
        return <FaProjectDiagram className="status-icon planned" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#27ae60'; // Green for near complete
    if (progress >= 40) return '#f39c12'; // Orange for mid-way
    return '#3498db'; // Blue for early stages
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="projects-section">
      <div className="section-header">
        <h2><FaProjectDiagram /> Barangay Development Projects</h2>
        <p>Ongoing and completed initiatives to improve our community</p>
        <button 
          className="add-project-btn" 
          onClick={() => {
            setShowForm(!showForm);
            setEditMode(false);
            setNewProject(emptyProject);
          }}
        >
          <FaPlus /> {showForm ? 'Cancel' : 'Add New Project'}
        </button>
      </div>

      {showForm && (
        <div className="project-form-container">
          <form className="project-form" onSubmit={handleSubmit}>
            <h3>{editMode ? 'Edit Project' : 'Add New Project'}</h3>
            
            <div className="form-group">
              <label htmlFor="title">Project Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProject.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={newProject.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={newProject.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="budget">Budget (₱)</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={newProject.budget}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={newProject.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={newProject.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newProject.location}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="beneficiaries">Beneficiaries</label>
              <input
                type="text"
                id="beneficiaries"
                name="beneficiaries"
                value={newProject.beneficiaries}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => {
                setShowForm(false);
                setEditMode(false);
                setNewProject(emptyProject);
              }} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Project' : 'Add Project')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div 
              key={project.id} 
              className={`project-card ${project.status?.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="project-header">
                <h3 onClick={() => openProjectModal(project)} className="project-title">{project.title}</h3>
                <div className="project-status">
                  {getStatusIcon(project.status)}
                  <span>{project.status}</span>
                </div>
              </div>
              
              <div className="project-details" onClick={() => openProjectModal(project)}>
                <p className="project-description">{project.description}</p>
                
                {/* Progress Bar */}
                <div className="project-progress">
                  <div className="progress-info">
                    <div className="progress-label">
                      <FaChartLine className="meta-icon" />
                      <span>Progress: {project.progress}%</span>
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: getProgressColor(project.progress)
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="project-meta">
                  <div className="meta-item">
                    <FaCalendarAlt className="meta-icon" />
                    <span>
                      {formatDate(project.start_date)} 
                      {project.end_date && ` - ${formatDate(project.end_date)}`}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <FaMoneyBillWave className="meta-icon" />
                    <span>₱{project.budget?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="project-actions">
                <button 
                  className="edit-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  className={`delete-btn ${deleteConfirm === project.id ? 'confirm' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.id);
                  }}
                >
                  <FaTrash /> {deleteConfirm === project.id ? 'Confirm' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <p>No projects available at this time.</p>
          </div>
        )}
      </div>
      
      {/* Project Details Modal */}
      {showModal && selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.title}</h2>
              <button className="close-modal" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-status">
                <span className={`status-badge ${selectedProject.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {getStatusIcon(selectedProject.status)}
                  {selectedProject.status}
                </span>
              </div>
              
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedProject.description}</p>
              </div>
              
              <div className="modal-progress">
                <h3>Progress</h3>
                <div className="progress-info">
                  <div className="progress-label">
                    <span>{selectedProject.progress}% Complete</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${selectedProject.progress}%`,
                      backgroundColor: getProgressColor(selectedProject.progress)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="modal-grid">
                <div className="modal-section">
                  <h3>Timeline</h3>
                  <p><strong>Start Date:</strong> {formatDate(selectedProject.start_date)}</p>
                  <p><strong>End Date:</strong> {formatDate(selectedProject.end_date)}</p>
                </div>
                
                <div className="modal-section">
                  <h3>Budget</h3>
                  <p>₱{selectedProject.budget?.toLocaleString() || 'Not specified'}</p>
                </div>
              </div>
              
              {(selectedProject.location || selectedProject.beneficiaries) && (
                <div className="modal-grid">
                  {selectedProject.location && (
                    <div className="modal-section">
                      <h3>Location</h3>
                      <p>{selectedProject.location}</p>
                    </div>
                  )}
                  
                  {selectedProject.beneficiaries && (
                    <div className="modal-section">
                      <h3>Beneficiaries</h3>
                      <p>{selectedProject.beneficiaries}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="edit-btn" onClick={() => handleEdit(selectedProject)}>
                <FaEdit /> Edit Project
              </button>
              <button 
                className={`delete-btn ${deleteConfirm === selectedProject.id ? 'confirm' : ''}`}
                onClick={() => handleDelete(selectedProject.id)}
              >
                <FaTrash /> {deleteConfirm === selectedProject.id ? 'Confirm Delete' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectsDashboard;