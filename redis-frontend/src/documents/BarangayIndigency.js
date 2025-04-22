// documents/BarangayIndigency.js
import React from 'react';
import './DocumentStyles.css';


function BarangayIndigency({ resident, documentData, officials }) {
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
    <div className="document indigency-certificate">
      <div className="document-header">
        <div className="logo-container">
        <img src="/cityLogo.png" alt="City Logo" className="logo" />
        </div>
        <div className="header-text">
          <h1>Republic of the Philippines</h1>
          <h2>City of Somewhere</h2>
          <h2>BARANGAY MAHAYAHAY</h2>
          <h3>OFFICE OF THE PUNONG BARANGAY</h3>
        </div>
        <div className="logo-container">
        <img src="/barangayLogo.png" alt="Barangay Logo" className="logo" />
        </div>
      </div>

      <div className="document-title">
        <h1>CERTIFICATE OF INDIGENCY</h1>
        <div className="document-id">{documentData.documentId}</div>
      </div>

      <div className="document-content">
        <p className="salutation">TO WHOM IT MAY CONCERN:</p>
        
        <p className="content-paragraph">
          This is to certify that <span className="resident-name">{resident.full_name}</span>,
          {' '}{resident.age} years old, {resident.civil_status.toLowerCase()}, 
          {resident.occupation ? ` with occupation as ${resident.occupation.toLowerCase()}` : ' unemployed'}, 
          is a bonafide resident of Purok {resident.purok}, Barangay Mahayahay, 
          City of Somewhere and belongs to the indigent family in our barangay.
        </p>
        
        {documentData.purpose && (
          <p className="content-paragraph">
            This certification is being issued upon the request of the above-named person 
            for the purpose of <span className="purpose">{documentData.purpose}</span>.
          </p>
        )}
        
        {documentData.additionalInfo && (
          <p className="content-paragraph">
            Additional Information: {documentData.additionalInfo}
          </p>
        )}
        
        <p className="content-paragraph">
          Issued this {formattedDate} at Barangay Mahayahay, City of Somewhere.
          Valid until {formattedValidUntil}.
        </p>
      </div>

      <div className="document-footer">
        <div className="official-signature">
          <div className="signature-line"></div>
          <div className="official-name">{officials.captain}</div>
          <div className="official-title">Punong Barangay</div>
        </div>
        
        <div className="document-seal">
          <div className="seal-text">Official Seal</div>
        </div>
      </div>
      
      <div className="document-footer-notes">
        <p>Not valid without official seal</p>
        <p>Please report any case of solicitation concerning this document to the Office of the Punong Barangay</p>
      </div>
    </div>
  );
}

export default BarangayIndigency;