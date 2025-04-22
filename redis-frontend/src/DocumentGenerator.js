// DocumentGenerator.js - Main component for document generation
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPrint, FaArrowLeft, FaFileAlt, FaDownload } from 'react-icons/fa';
import { usePDF } from 'react-to-pdf';
import './DocumentGenerator.css';
import BarangayCertificate from './documents/BarangayCertificate';
import BarangayIndigency from './documents/BarangayIndigency';
import MedicalCertificate from './documents/MedicalCertificate';


const API_URL = 'http://localhost:5000/residents';

function DocumentGenerator() {
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentType, setDocumentType] = useState('barangay');
  const [documentData, setDocumentData] = useState({
    purpose: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    documentId: '',
    additionalInfo: ''
  });
  const [officials, setOfficials] = useState({
    captain: 'Hon. John Doe',
    secretary: 'Jane Smith',
    councilors: ['Councilor 1', 'Councilor 2', 'Councilor 3']
  });
  
  const { id } = useParams();
  const navigate = useNavigate();
  const documentRef = useRef();
  
  // Initialize the PDF generator hook
  const { toPDF, targetRef } = usePDF({
    filename: resident ? 
      `${documentType}-${resident.last_name}-${documentData.documentId}.pdf` :
      'document.pdf',
    page: { 
      format: 'letter',
      orientation: 'portrait'
    }
  });

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        setResident(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch resident data');
        setLoading(false);
      }
    };

    // Generate a document ID with format: DOC-TYPE-YYYYMMDD-XXXX
    const generateDocumentId = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      const typePrefix = documentType.substring(0, 3).toUpperCase();
      
      return `${typePrefix}-${year}${month}${day}-${random}`;
    };

    // Set default valid until date (3 months from now)
    const setDefaultValidUntil = () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    };

    fetchResident();
    setDocumentData(prev => ({
      ...prev,
      documentId: generateDocumentId(),
      validUntil: setDefaultValidUntil()
    }));

    // Fetch officials data if available
    const fetchOfficials = async () => {
      try {
        const response = await axios.get('http://localhost:5000/officials');
        setOfficials(response.data);
      } catch (err) {
        console.error('Failed to fetch officials data, using defaults');
      }
    };
    
    fetchOfficials();
  }, [id, documentType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
    // Regenerate document ID when type changes
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const typePrefix = e.target.value.substring(0, 3).toUpperCase();
    
    setDocumentData(prev => ({
      ...prev,
      documentId: `${typePrefix}-${year}${month}${day}-${random}`
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      toPDF();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="document-loading">Loading resident data...</div>;
  if (error) return <div className="document-error">{error}</div>;
  if (!resident) return <div className="document-error">Resident not found</div>;

  // Render the appropriate document based on type
  const renderDocument = () => {
    switch(documentType) {
      case 'barangay':
        return <BarangayCertificate resident={resident} documentData={documentData} officials={officials} />;
      case 'indigency':
        return <BarangayIndigency resident={resident} documentData={documentData} officials={officials} />;
      case 'medical':
        return <MedicalCertificate resident={resident} documentData={documentData} officials={officials} />;
      default:
        return <div>Select a document type</div>;
    }
  };

  return (
    <div className="document-generator">
      <div className="document-controls no-print">
        <button onClick={handleBack} className="back-button">
          <FaArrowLeft /> Back to Residents
        </button>
        
        <div className="document-form">
          <h2><FaFileAlt /> Generate Document for {resident.full_name}</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Document Type:</label>
              <select value={documentType} onChange={handleDocumentTypeChange}>
                <option value="barangay">Barangay Certificate</option>
                <option value="indigency">Certificate of Indigency</option>
                <option value="medical">Medical Certificate</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Document ID:</label>
              <input 
                type="text" 
                name="documentId" 
                value={documentData.documentId} 
                onChange={handleInputChange}
                readOnly
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Purpose:</label>
              <input 
                type="text" 
                name="purpose" 
                value={documentData.purpose} 
                onChange={handleInputChange}
                placeholder="e.g., Employment, Scholarship, etc."
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date:</label>
              <input 
                type="date" 
                name="issueDate" 
                value={documentData.issueDate} 
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Valid Until:</label>
              <input 
                type="date" 
                name="validUntil" 
                value={documentData.validUntil} 
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Additional Information:</label>
              <textarea 
                name="additionalInfo" 
                value={documentData.additionalInfo} 
                onChange={handleInputChange}
                placeholder="Any additional details needed for the certificate"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="document-actions">
          <button onClick={handlePrint} className="print-button">
            <FaPrint /> Print Document
          </button>
          <button onClick={handleDownloadPDF} className="download-button">
            <FaDownload /> Download PDF
          </button>
        </div>
      </div>
      
      <div className="document-preview" ref={targetRef}>
        {renderDocument()}
      </div>
    </div>
  );
}

export default DocumentGenerator;