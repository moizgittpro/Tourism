import React, { useState, useEffect, useRef } from 'react';
import './journey_curator.css';

function Chat() {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I can help you plan your trip. Please tell me your destination.', step: 'destination' }
  ]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState('destination');
  const [isTyping, setIsTyping] = useState(false);
  const [tripData, setTripData] = useState({
    destination: null,
    origin: null,
    days: null,
    mood: null,
    route: null
  });
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [progress, setProgress] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // This would normally be a real API call
  const mockAPICall = (userInput) => {
    setIsTyping(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let nextStep = currentStep;
        let response = '';
        
        if (currentStep === 'destination') {
          setTripData(prev => ({ ...prev, destination: userInput }));
          response = `Great! ${userInput} is a wonderful destination. Now, where will you be starting your journey from?`;
          nextStep = 'origin';
        } else if (currentStep === 'origin') {
          setTripData(prev => ({ ...prev, origin: userInput }));
          response = `Starting from ${userInput}. How many days do you plan to travel?`;
          nextStep = 'days';
        } else if (currentStep === 'days') {
          setTripData(prev => ({ ...prev, days: userInput }));
          response = `${userInput} days is perfect for this trip. What mood or theme are you looking for? (e.g., Adventure, Relaxation, Historical, Cultural)`;
          nextStep = 'mood';
        } else if (currentStep === 'mood') {
          setTripData(prev => ({ ...prev, mood: userInput }));
          response = `A ${userInput} journey sounds wonderful! What's your preferred mode of transportation? (e.g., Car, Train, Plane, Bus)`;
          nextStep = 'route';
        } else if (currentStep === 'route') {
          setTripData(prev => ({ ...prev, route: userInput }));
          response = `Perfect! You've provided all the information I need. Let me prepare a summary of your trip plan.`;
          nextStep = 'summary';
          
          // Generate mock summary data
          const mockSummaryData = generateMockSummary({
            destination: tripData.destination,
            origin: tripData.origin,
            days: tripData.days,
            mood: tripData.mood,
            route: userInput
          });
          
          setSummaryData(mockSummaryData);
        }
        
        resolve({ message: response, step: nextStep });
        setIsTyping(false);
      }, 1500);
    });
  };

  const generateMockSummary = (data) => {
    const daysCount = parseInt(data.days);
    const dayPlans = [];
    
    for (let i = 1; i <= daysCount; i++) {
      dayPlans.push({
        day: i,
        title: `Day ${i}: ${i === 1 ? 'Arrival & Exploration' : i === daysCount ? 'Final Adventures' : `${data.mood} Adventures`}`,
        description: `Start your day with breakfast at a local café. ${
          i === 1 
            ? `Arrive in ${data.destination} and check into your accommodation.` 
            : `Continue exploring ${data.destination} with a focus on ${data.mood.toLowerCase()} attractions.`
        } Visit key landmarks and enjoy local cuisine for lunch. ${
          data.mood === 'Historical' 
            ? 'Tour historical monuments and museums.' 
            : data.mood === 'Adventure' 
              ? 'Experience thrilling outdoor activities.' 
              : 'Immerse yourself in the local culture.'
        } End the day with dinner at a renowned restaurant.`,
        highlights: [
          `Morning: ${i === 1 ? 'Arrival & Check-in' : 'Local Exploration'}`,
          `Afternoon: ${data.mood} Activities`,
          `Evening: Cultural Experience`,
        ],
        image: `/api/placeholder/400/200`
      });
    }
    
    return {
      title: `Your ${data.mood} Trip: ${data.origin} to ${data.destination}`,
      overview: `A ${daysCount}-day ${data.mood.toLowerCase()} journey from ${data.origin} to ${data.destination} by ${data.route.toLowerCase()}.`,
      days: dayPlans,
      tips: [
        "Pack appropriate clothes for the weather",
        `Bring comfortable shoes for ${data.mood.toLowerCase()} activities`,
        `Learn a few phrases in the local language`,
        `Exchange some currency before arrival`
      ]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    const userInput = input;
    setInput('');
    
    try {
      // Mock API call
      const response = await mockAPICall(userInput);
      
      // Add bot response
      setMessages(prev => [...prev, { type: 'bot', content: response.message, step: response.step }]);
      setCurrentStep(response.step);
      
      // Update progress
      updateProgress(response.step);
      
      // Show summary if we're at that step
      if (response.step === 'summary') {
        setTimeout(() => {
          setShowSummary(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev, 
        { type: 'bot', content: 'Sorry, there was an error processing your request. Please try again.' }
      ]);
    }
  };

  const updateProgress = (step) => {
    const steps = ['destination', 'origin', 'days', 'mood', 'route', 'summary'];
    const currentIndex = steps.indexOf(step);
    const progressPercentage = (currentIndex / (steps.length - 1)) * 100;
    setProgress(progressPercentage);
  };

  const resetConversation = () => {
    setMessages([
      { type: 'bot', content: 'Hello! I can help you plan your trip. Please tell me your destination.', step: 'destination' }
    ]);
    setCurrentStep('destination');
    setTripData({
      destination: null,
      origin: null,
      days: null,
      mood: null,
      route: null
    });
    setShowSummary(false);
    setSummaryData(null);
    setProgress(0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">✈️</span>
          <h1>TripPlanner AI</h1>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="step-indicators">
          <div className={`step ${currentStep === 'destination' || progress >= 20 ? 'active' : ''}`}>Destination</div>
          <div className={`step ${currentStep === 'origin' || progress >= 40 ? 'active' : ''}`}>Origin</div>
          <div className={`step ${currentStep === 'days' || progress >= 60 ? 'active' : ''}`}>Days</div>
          <div className={`step ${currentStep === 'mood' || progress >= 80 ? 'active' : ''}`}>Mood</div>
          <div className={`step ${currentStep === 'route' || progress >= 100 ? 'active' : ''}`}>Route</div>
        </div>
      </header>

      <main className="content-area">
        {!showSummary ? (
          <div className="chat-container">
            <div className="messages-container">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message ${message.type}-message ${message.step === 'summary' ? 'summary-preview' : ''}`}
                >
                  <div className="message-avatar">
                    {message.type === 'bot' ? '🤖' : '👤'}
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot-message typing">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form className="input-container" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter your ${
                  currentStep === 'destination' ? 'destination' :
                  currentStep === 'origin' ? 'starting point' :
                  currentStep === 'days' ? 'number of days' :
                  currentStep === 'mood' ? 'preferred mood/theme' :
                  currentStep === 'route' ? 'transportation method' :
                  'message'
                }...`}
                disabled={isTyping || currentStep === 'summary'}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping || currentStep === 'summary'}
                className={input.trim() && !isTyping && currentStep !== 'summary' ? 'active' : ''}
              >
                <span className="send-icon">➤</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="summary-container">
            <div className="summary-header">
              <h2>{summaryData.title}</h2>
              <p className="overview">{summaryData.overview}</p>
            </div>
            
            <div className="days-container">
              {summaryData.days.map((day, index) => (
                <div key={index} className="day-card">
                  <div className="day-header">
                    <h3>{day.title}</h3>
                  </div>
                  <div className="day-content">
                    <div className="day-image">
                      <img src={day.image} alt={`Day ${day.day}`} />
                    </div>
                    <p className="day-description">{day.description}</p>
                    <div className="day-highlights">
                      {day.highlights.map((highlight, i) => (
                        <div key={i} className="highlight-item">
                          <span className="highlight-icon">✓</span>
                          <span className="highlight-text">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="travel-tips">
              <h3>Travel Tips</h3>
              <ul>
                {summaryData.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <button className="new-trip-button" onClick={resetConversation}>
              Plan Another Trip
            </button>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>© 2025 TripPlanner AI | Your AI Travel Assistant</p>
      </footer>
    </div>
  );
}

export default Chat;