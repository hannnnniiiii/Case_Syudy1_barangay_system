// documents/MedicalCertificate.js
import React from 'react';
import './DocumentStyles.css';


function MedicalCertificate({ resident, documentData, officials }) {
  const today = new Date(documentData.issueDate);
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const validUntil = new Date(documentData.validUntil);
  const formattedValidUntil = validUntil.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="document medical-certificate">
      <div className="document-header">
        <div className="logo-container">
        <img src="/cityLogo.png" alt="City Logo" className="logo" />
        </div>
        <div className="header-text">
          <h1>Republic of the Philippines</h1>
          <h2>City of Somewhere</h2>
          <h2>BARANGAY MAHAYAHAY</h2>
          <h3>BARANGAY HEALTH CENTER</h3>
        </div>
        <div className="logo-container">
        <img src="/barangayLogo.png" alt="Barangay Logo" className="logo" />
        </div>
      </div>

      <div className="document-title">
        <h1>MEDICAL CERTIFICATE</h1>
        <div className="document-id">{documentData.documentId}</div>
      </div>

      <div className="document-content">
        <p className="salutation">TO WHOM IT MAY CONCERN:</p>
        
        <p className="content-paragraph">
          This is to certify that <span className="resident-name">{resident.full_name}</span>,
          {' '}{resident.age} years old, {resident.civil_status.toLowerCase()}, 
          residing at Purok {resident.purok}, Barangay Mahayahay, 
          City of Somewhere, was examined at the Barangay Health Center 
          on {formattedDate}.
        </p>
        
        <div className="medical-details">
          <h3>PHYSICAL EXAMINATION:</h3>
          <p>Height: ___________ cm</p>
          <p>Weight: ___________ kg</p>
          <p>Blood Pressure: ___________ mmHg</p>
          <p>Pulse Rate: ___________ bpm</p>
          <p>Temperature: ___________ °C</p>
        </div>
        
        <div className="medical-details">
          <h3>DIAGNOSIS/REMARKS:</h3>
          <p className="diagnosis-box">
            {documentData.additionalInfo || "Patient is in good physical condition and fit to work/study."}
          </p>
        </div>
        
        {documentData.purpose && (
          <p className="content-paragraph">
            This certification is being issued upon the request of the above-named person 
            for the purpose of <span className="purpose">{documentData.purpose}</span>.
          </p>
        )}
        
        <p className="content-paragraph">
          Issued this {formattedDate} at Barangay Mahayahay Health Center, City of Somewhere.
          Valid until {formattedValidUntil}.
        </p>
      </div>

      <div className="document-footer medical-footer">
        <div className="official-signature">
          <div className="signature-line"></div>
          <div className="official-name">Dr. Medical Officer</div>
          <div className="official-title">Barangay Health Officer</div>
          <div className="license-number">License No.: 12345</div>
        </div>
        
        <div className="official-signature">
          <div className="signature-line"></div>
          <div className="official-name">{officials.captain}</div>
          <div className="official-title">Punong Barangay</div>
        </div>
      </div>
      
      <div className="document-footer-notes">
        <p>Not valid without official seal</p>
      </div>
    </div>
  );
}

export default MedicalCertificate;