import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InstagramForm.css'; 

const InstagramAnalysisForm: React.FC = () => {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [displayText, setDisplayText] = useState('📊 Instagram Analysis');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API request/processing
      console.log('Analyzing Instagram URL:', instagramUrl);
      
      // Wait a bit to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard after submission
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstagramUrl(e.target.value);
  };

  return (
    <div className="form-wrapper">
      <div className="container">
        <h1 id="typing-heading">{displayText}</h1>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter Instagram username..." 
            value={instagramUrl}
            onChange={handleInputChange}
            disabled={loading}
            required
          />
          
          <button 
            className={`ripple ${loading ? 'loading' : ''}`} 
            type="submit"
            disabled={loading}
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
        </form>
        
        <p>Track your engagement, and trends to grow smarter! 📈</p>
      </div>
    </div>
  );
};

export default InstagramAnalysisForm;