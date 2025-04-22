import React from 'react';
import { FaUsers, FaMale, FaFemale, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import ProjectsDashboard from './ProjectsDashboard'; // Import the new component
import './home.css';

const Home = ({ stats }) => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-overlay">
          <h1>Welcome to Barangay Mahayahay</h1>
          <p>A vibrant and progressive community in the heart of our municipality</p>
        </div>
      </div>

      <section className="about-section">
        <div className="about-content">
          <h2>About Barangay Mahayahay</h2>
          <p>
          Barangay Mahayahay is a vibrant urban community in Iligan City, Northern Mindanao, 
          known for its rich history and strong sense of unity. Established on November 22, 1962, 
          through the efforts of the late Congressman Laurentino Lluch Badelles, Mahayahay has 
          since grown into a dynamic residential and commercial hub.
          </p>
          <p>
          Over the years, Mahayahay has adapted to changes in population and development, making it 
          a resilient and progressive community. The barangay continues to provide essential services 
          and programs for its residents under the leadership of Barangay Chairman Joel G. Labandero.

          Barangay Mahayahay is not just a place—it is a home to hardworking individuals, thriving businesses, 
          and a community that values camaraderie and progress. As part of Iligan City, it contributes 
          to the city's rich cultural heritage and economic growth, making it a significant part of the 
          local landscape.

         </p>
          <p>
            Our barangay focuses on inclusive development, providing support for education, 
            livelihood, health, and social services. We believe in empowering our residents 
            and creating an environment where everyone can thrive.
          </p>
          <p>
          For concerns and inquiries, the Barangay Hall can be reached at 0995-631-9635 or via landline at 221-6747.
          </p>
        </div>
      </section>

      <section className="map-section">
        <h2><FaMapMarkerAlt className="location-icon" /> Find Us</h2>
        <p>Visit Barangay Mahayahay, located in the heart of Iligan City, Northern Mindanao</p>
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.1085366015636!2d124.2360913!3d8.6750842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3255af5cb2815c29%3A0x215158424d4b0a08!2sMahayahay%2C%20Iligan%20City%2C%20Lanao%20del%20Norte!5e0!3m2!1sen!2sph!4v1711855152973!5m2!1sen!2sph" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Barangay Mahayahay Map"
          ></iframe>
        </div>
      </section>

      {/* New Projects Dashboard Section */}
      <ProjectsDashboard />

      <section className="community-stats">
        <h2>Our Community at a Glance</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon resident-icon">
              <FaUsers />
            </div>
            <div className="stat-details">
              <h3>Total Residents</h3>
              <p>{stats.totalResidents}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon male-icon">
              <FaMale />
            </div>
            <div className="stat-details">
              <h3>Male Residents</h3>
              <p>{stats.maleCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon female-icon">
              <FaFemale />
            </div>
            <div className="stat-details">
              <h3>Female Residents</h3>
              <p>{stats.femaleCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purok-icon">
              <FaHome />
            </div>
            <div className="stat-details">
              <h3>Total Puroks</h3>
              <p>{Object.keys(stats.purokStats).length}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;