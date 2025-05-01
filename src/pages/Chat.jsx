/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Compass, Truck, RefreshCw, Send, ArrowRight, Loader, ClipboardList } from 'lucide-react';
import './journey_curator.css';

const Chat = () => {
  const [currentStep, setCurrentStep] = useState('destination');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can help you plan your trip. Please tell me your destination.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState('');
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState('aurora');
  const [allInputs, setAllInputs] = useState({});
  const messagesEndRef = useRef(null);

  // Define steps and their configurations
  const steps = {
    destination: {
      icon: <MapPin />,
      title: 'Destination',
      placeholder: 'Where are you going?',
      emoji: '🏝️'
    },
    origin: {
      icon: <MapPin />,
      title: 'Origin',
      placeholder: 'Where are you starting from?',
      emoji: '🏠'
    },
    days: {
      icon: <Calendar />,
      title: 'Duration',
      placeholder: 'How many days?',
      emoji: '📅'
    },
    mood: {
      icon: <Compass />,
      title: 'Travel Mood',
      placeholder: 'Adventure, Relaxation, Historical...',
      emoji: '🌈'
    },
    route: {
      icon: <Truck />,
      title: 'Transportation',
      placeholder: 'Car, Train, Plane...',
      emoji: '🚗'
    },
    summary: {
      icon: <ClipboardList />,
      title: 'Summary',
      placeholder: '',
      emoji: '✨'
    }
  };

  // Themes configuration
  const themes = {
    aurora: 'theme-aurora',
    sunset: 'theme-sunset',
    ocean: 'theme-ocean',
    forest: 'theme-forest'
  };

  // Calculate progress based on current step
  useEffect(() => {
    const stepIndex = Object.keys(steps).indexOf(currentStep);
    const totalSteps = Object.keys(steps).length - 1;
    const newProgress = (stepIndex / totalSteps) * 100;
    setProgress(newProgress);
    
    if (currentStep === 'summary') {
      setShowSummary(true);
    }
  }, [currentStep, steps]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
      });
      
      const data = await response.json();
      
      // Store input for the current step
      setAllInputs(prev => ({
        ...prev,
        [currentStep]: userInput
      }));

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      setCurrentStep(data.step);
      
      // Handle summary step
      if (data.step === 'summary') {
        setSummary(data.message);
        setShowSummary(true);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const resetConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/reset', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      setMessages([{ role: 'assistant', content: data.message }]);
      setCurrentStep('destination');
      setShowSummary(false);
      setSummary('');
      setProgress(0);
      setAllInputs({});
      
    } catch (error) {
      console.error('Error resetting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummary = () => {
    if (!summary) return null;

    const days = summary.split(/Day \d+:/g).filter(Boolean);
    const hasDays = days.length > 1;

    return (
      <div className="summary-container">
        <div className="summary-card">
          <div className="summary-header">
            <h2>Your Personalized Travel Plan</h2>
            <div className="summary-badge">Dream Journey</div>
          </div>
          <div className="summary-content">
            <div className="summary-overview">
              <h3>Trip Details</h3>
              <div className="trip-details">
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>From: {allInputs.origin}</span>
                </div>
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>To: {allInputs.destination}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Duration: {allInputs.days} days</span>
                </div>
                <div className="detail-item">
                  <Compass size={16} />
                  <span>Style: {allInputs.mood}</span>
                </div>
                <div className="detail-item">
                  <Truck size={16} />
                  <span>Transport: {allInputs.route}</span>
                </div>
              </div>
            </div>
            
            <div className="daily-summaries">
              {hasDays ? (
                days.map((day, index) => (
                  <div key={index} className="day-summary">
                    <h3>Day {index + 1}</h3>
                    {day.split('\n').map((line, i) => (
                      line.trim() ? <p key={i}>{line.trim()}</p> : null
                    ))}
                  </div>
                ))
              ) : (
                <div className="general-summary">
                  {summary.split('\n').map((line, i) => (
                    line.trim() ? <p key={i}>{line.trim()}</p> : null
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="summary-footer">
            <button className="new-plan-btn" onClick={resetConversation}>
              <RefreshCw size={16} />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>
      </div>
    );
  };
// Replace the existing return statement with:

return (
  <div className={`travel-planner ${themes[theme]}`}>
    <div className="theme-switcher">
      <button 
        className={`theme-btn aurora ${theme === 'aurora' ? 'active' : ''}`} 
        onClick={() => handleThemeChange('aurora')}
        title="Aurora Theme"
      ></button>
      <button 
        className={`theme-btn sunset ${theme === 'sunset' ? 'active' : ''}`} 
        onClick={() => handleThemeChange('sunset')}
        title="Sunset Theme"
      ></button>
      <button 
        className={`theme-btn ocean ${theme === 'ocean' ? 'active' : ''}`} 
        onClick={() => handleThemeChange('ocean')}
        title="Ocean Theme"
      ></button>
      <button 
        className={`theme-btn forest ${theme === 'forest' ? 'active' : ''}`} 
        onClick={() => handleThemeChange('forest')}
        title="Forest Theme"
      ></button>
    </div>

    <div className="container">
      <div className="sidebar">
        <div className="app-title">
          <h1>Wanderlust</h1>
          <p>Your personal journey creator</p>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{Math.round(progress)}% completed</p>
        </div>
        
        <div className="steps-container">
          {Object.entries(steps).map(([key, step]) => (
            <div 
              key={key} 
              className={`step-item ${Object.keys(steps).indexOf(key) <= Object.keys(steps).indexOf(currentStep) ? 'active' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="reset-btn" onClick={resetConversation}>
          <RefreshCw size={16} />
          <span>New Journey</span>
        </button>
      </div>
      
      <div className="main-content">
        {showSummary ? (
          renderSummary()
        ) : (
          <>
            <div className="messages-container">
              <div className="messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.role}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="assistant-avatar">JC</div>
                    )}
                    <div className="message-content">
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="user-avatar">YOU</div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="assistant-avatar">JC</div>
                    <div className="message-content loading">
                      <div className="dot-typing"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="input-container">
              <div className="current-step-indicator">
                <div className="step-icon">{steps[currentStep].icon}</div>
                <span>{steps[currentStep].title}</span>
              </div>
              <div className="input-field">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={steps[currentStep].placeholder}
                  disabled={isLoading}
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? <Loader size={18} className="spinner" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);};

export default Chat;
  