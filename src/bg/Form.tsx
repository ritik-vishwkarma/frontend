import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InstagramForm.css'; 

const InstagramAnalysisForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [displayText, setDisplayText] = useState('📊 Instagram Analysis');
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const navigate = useNavigate();

  // Typing effect for heading
  useEffect(() => {
    const headingText = " 🚀";
    let i = 0;
    let currentText = '📊 Instagram Analysis';
    
    function typeEffect() {
      if (i < headingText.length) {
        setDisplayText(currentText + headingText.charAt(i));
        currentText += headingText.charAt(i);
        i++;
        setTimeout(typeEffect, 100);
      }
    }
    
    typeEffect();
  }, []);

  // Function to update progress message during long-running analysis
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loading) {
      const messages = [
        "Processing your request...",
        "Analyzing Instagram profile...",
        "Gathering engagement data...",
        "This may take several minutes...",
        "Analyzing hashtag performance...",
        "Examining post frequency...",
        "Still working on it...",
        "Fetching insights...",
      ];
      
      let index = 0;
      setProgressMessage(messages[0]);
      
      interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setProgressMessage(messages[index]);
      }, 8000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Construct URL from username
      const fullURL = `https://www.instagram.com/${username}`;

      console.log('Calling API endpoint with:', fullURL);

      const requestBody = {
        "directUrls": [
          fullURL
        ],
        "resultsType": "posts",
        "resultsLimit": 50,
        "searchType": "hashtag",
        "searchLimit": 1,
        "addParentData": false
      };
      
      // Call the endpoint with the Instagram URL using axios
      const response = await axios.post(
        'http://localhost:3000/apify/run-actor',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 180000,
        }
      );
      
      console.log('Analysis complete:', response.data);
      
      // Extract the collection name from the response
      const collectionName = response.data.data?.collectionName;
      
      if (!collectionName) {
        throw new Error('Collection name not found in response');
      }
      
      // Set the collection name in the database service for later use
      try {
        // Store the collection name in localStorage for the database service to use
        localStorage.setItem('currentCollectionName', collectionName);
        console.log('Stored collection name for database service:', collectionName);
      } catch (storageError) {
        console.warn('Could not store collection name:', storageError);
        // Continue execution even if storage fails
      }
      
      // Navigate to dashboard with the result data
      navigate('/dashboard', { 
        state: { 
          username,
          fullURL,
          collectionName,
          analysisData: response.data.data?.data || [] 
        } 
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Better error handling with axios
      if (axios.isAxiosError(error)) {
        console.error('API error details:', error.response?.data || error.message);
        alert(`API error: ${error.response?.data?.message || error.message}`);
      } else {
        alert('An error occurred during analysis. Please try again.');
      }
      
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clean the username input - remove @ if present and trim spaces
    const cleanUsername = e.target.value.replace('@', '').trim();
    setUsername(cleanUsername);
  };

  return (
    <div className="form-wrapper">
      <div className="container">
        <h1 id="typing-heading">{displayText}</h1>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter Instagram username..." 
            value={username}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
          
          <button 
            className={`ripple ${loading ? 'loading' : ''}`} 
            type="submit"
            disabled={loading || !username}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              '🚀 Get Insights'
            )}
          </button>
          
          {loading && <p className="progress-message">{progressMessage}</p>}
        </form>
        
        <p>Track your engagement, and trends to grow smarter! 📈</p>
      </div>
    </div>
  );
};

export default InstagramAnalysisForm;