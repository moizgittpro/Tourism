/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Compass, Truck, RefreshCw, Send, ArrowRight, Loader, ClipboardList } from 'lucide-react';
import styles from './journey_curator.module.css';

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
  const themesMap = {
    aurora: styles.themeAurora,
    sunset: styles.themeSunset,
    ocean: styles.themeOcean,
    forest: styles.themeForest
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
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <h2>Your Personalized Travel Plan</h2>
            <div className={styles.summaryBadge}>Dream Journey</div>
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryOverview}>
              <h3>Trip Details</h3>
              <div className={styles.tripDetails}>
                <div className={styles.detailItem}>
                  <MapPin size={16} />
                  <span>From: {allInputs.origin}</span>
                </div>
                <div className={styles.detailItem}>
                  <MapPin size={16} />
                  <span>To: {allInputs.destination}</span>
                </div>
                <div className={styles.detailItem}>
                  <Calendar size={16} />
                  <span>Duration: {allInputs.days} days</span>
                </div>
                <div className={styles.detailItem}>
                  <Compass size={16} />
                  <span>Style: {allInputs.mood}</span>
                </div>
                <div className={styles.detailItem}>
                  <Truck size={16} />
                  <span>Transport: {allInputs.route}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.dailySummaries}>
              {hasDays ? (
                days.map((day, index) => (
                  <div key={index} className={styles.daySummary}>
                    <h3>Day {index + 1}</h3>
                    {day.split('\n').map((line, i) => (
                      line.trim() ? <p key={i}>{line.trim()}</p> : null
                    ))}
                  </div>
                ))
              ) : (
                <div className={styles.generalSummary}>
                  {summary.split('\n').map((line, i) => (
                    line.trim() ? <p key={i}>{line.trim()}</p> : null
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.summaryFooter}>
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
 <div className={`${styles.travelPlanner} ${themesMap[theme]}`}>
    <div className={styles.themeSwitcher}>
      <button 
        className={`${styles.themeBtn} ${styles.aurora} ${theme === 'aurora' ? styles.active : ''}`} 
        onClick={() => handleThemeChange('aurora')}
        title="Aurora Theme"
      ></button>
      <button 
        className={`${styles.themeBtn} ${styles.sunset} ${theme === 'sunset' ? styles.active : ''}`}
        onClick={() => handleThemeChange('sunset')}
        title="Sunset Theme"
      ></button>
      <button 
        className={`${styles.themeBtn} ${styles.ocean} ${theme === 'ocean' ? styles.active : ''}`}
        onClick={() => handleThemeChange('ocean')}
        title="Ocean Theme"
      ></button>
      <button 
        className={`${styles.themeBtn} ${styles.forest} ${theme === 'forest' ? styles.active : ''}`}
        onClick={() => handleThemeChange('forest')}
        title="Forest Theme"
      ></button>
    </div>

    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.appTitle}>
          <h1>Wanderlust</h1>
          <p>Your personal journey creator</p>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
          <p className={styles.progressText}>{Math.round(progress)}% completed</p>
        </div>
        
        <div className={styles.stepsContainer}>
          {Object.entries(steps).map(([key, step]) => (
            <div 
              key={key} 
              className={`${styles.stepItem} ${Object.keys(steps).indexOf(key) <= Object.keys(steps).indexOf(currentStep) ? styles.active : ''}`}
            >
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepInfo}>
                <div className={styles.stepTitle}>{step.title}</div>
              </div>
            </div>
          ))}
        </div>
        
        <button className={styles.resetBtn} onClick={resetConversation}>
          <RefreshCw size={16} />
          <span>New Journey</span>
        </button>
      </div>
      
      <div className={styles.mainContent}>
        {showSummary ? (
          renderSummary()
        ) : (
          <>
            <div className={styles.messagesContainer}>
              <div className={styles.messages}>
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`${styles.message} ${styles[message.role]}`}
                  >
                    {message.role === 'assistant' && (
                      <div className={styles.assistantAvatar}>JC</div>
                    )}
                    <div className={styles.messageContent}>
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className={styles.userAvatar}>YOU</div>
                    )}
                  </div>
                ))}
                {isLoading && (
                    <div className={`${styles.message} ${styles.assistant}`}>
                      <div className={styles.assistantAvatar}>JC</div>
                      <div className={`${styles.messageContent} ${styles.loading}`}>
                        <div className={styles.dotTyping}></div>
                      </div>
                    </div>
                  )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className={styles.inputContainer}>
              <div className={styles.currentStepIndicator}>
                <div className={styles.stepIcon}>{steps[currentStep].icon}</div>
                <span>{steps[currentStep].title}</span>
              </div>
              <div className={styles.inputField}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={steps[currentStep].placeholder}
                  disabled={isLoading}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? <Loader size={18} className={styles.spinner} /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)
};


export default Chat;
  