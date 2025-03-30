import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BackgroundAnimation from './bg/Background.tsx'
import EngagementOverTime from './components/plots/EngagementOverTime.tsx'
import HashtagWordCloud from './components/plots/Hashtag.tsx'
import TimeBasedInsights from './components/plots/TimeBasedPlots.tsx'
import './App.css'
import InstagramAnalysisForm from './bg/Form.tsx'
import ModelPieChart from './components/plots/ModelPieChart.tsx'
import TopPerformingPosts from './components/plots/ReachBasedPerformance.tsx'

function App() {
  return (
    <>
      <BackgroundAnimation />
      <Router>
        <Routes>
          {/* Landing page route */}
          <Route 
            path="/" 
            element={<InstagramAnalysisForm />} 
          />
          
          {/* Dashboard route */}
          <Route 
            path="/dashboard" 
            element={
              <div className="content-container">
                <EngagementOverTime />
                <TimeBasedInsights />
                <HashtagWordCloud />
                <ModelPieChart />
                <TopPerformingPosts />
              </div>
            } 
          />
          
          {/* Redirect any unknown routes to home */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </Router>
    </>
  )
}

export default App