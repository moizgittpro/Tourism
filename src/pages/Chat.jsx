import React, { useState, useEffect, useRef } from 'react';
import './journey_curator.css';
const REACT_APP_API_URL = process.env.REACT_APP_API_BASE_URL;

const getSessionIdFromPayload = (payload) => payload?.session_id || payload?.sessionId || null;

// Message component for chat bubbles
const Message = ({ message, sender }) => {
  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        {message}
      </div>
    </div>
  );
};

// Typing indicator component
const TypingIndicator = () => {
  return (
    <div className="message bot">
      <div className="message-content typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

const renderInlineText = (text) => {
  const parts = String(text || "").split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const renderTripSummary = (summary) => {
  const lines = String(summary || "").split(/\r?\n/);
  const elements = [];
  let bulletItems = [];
  let numberedItems = [];
  let keyIndex = 0;

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul key={`ul-${keyIndex++}`} className="summary-markdown-list">
          {bulletItems.map((item, index) => (
            <li key={`bullet-${index}`}>{renderInlineText(item)}</li>
          ))}
        </ul>
      );
      bulletItems = [];
    }
  };

  const flushNumbered = () => {
    if (numberedItems.length > 0) {
      elements.push(
        <ol key={`ol-${keyIndex++}`} className="summary-markdown-ordered-list">
          {numberedItems.map((item, index) => (
            <li key={`numbered-${index}`}>{renderInlineText(item)}</li>
          ))}
        </ol>
      );
      numberedItems = [];
    }
  };

  const flushLists = () => {
    flushBullets();
    flushNumbered();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      return;
    }

    if (/^(\*\*\*|---)$/.test(line)) {
      flushLists();
      elements.push(<hr key={`hr-${keyIndex++}`} className="summary-divider" />);
      return;
    }

    if (/^###\s+/.test(line)) {
      flushLists();
      elements.push(
        <h3 key={`h3-${keyIndex++}`} className="summary-markdown-heading">
          {renderInlineText(line.replace(/^###\s+/, ""))}
        </h3>
      );
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushBullets();
      numberedItems.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      flushNumbered();
      bulletItems.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    flushLists();
    elements.push(
      <p key={`p-${keyIndex++}`} className="summary-markdown-paragraph">
        {renderInlineText(line)}
      </p>
    );
  });

  flushLists();
  return elements;
};

const FlightCard = ({ flight }) => {
  return (
    <div className="summary-card flight-card">
      <div className="card-header">
        <i className="fa-solid fa-plane"></i>
        <h3>{flight.name || "Flight"}</h3>
        {flight.is_best && <span className="best-badge">Best Value</span>}
      </div>
      <div className="card-content">
        <div className="flight-time">
          <div className="departure">
            <span className="time">{flight.departure || "N/A"}</span>
          </div>
          <div className="flight-duration">
            <span className="duration-line"></span>
            <span>{flight.duration || "N/A"}</span>
          </div>
          <div className="arrival">
            <span className="time">{flight.arrival || "N/A"}</span>
          </div>
        </div>
        <div className="flight-details">
          <p><strong>Stops:</strong> {flight.stops || "Direct"}</p>
          <p className="price"><strong>Price:</strong> ${flight.price || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

// Main App component
function Chat() {
  // Existing state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('destination');
  const [tripSummary, setTripSummary] = useState(null);
  const [flights, setFlights] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Initialize session with backend
        const response = await fetch(`${REACT_APP_API_URL}/chat/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = await response.json();
        const nextSessionId = getSessionIdFromPayload(data);
        if (nextSessionId) {
          setSessionId(nextSessionId);
          setIsSessionActive(true);
        }
        
        // Show initial bot message
        handleBotResponse(data.message || "Hello! I can help you plan your trip. Please tell me your destination.");
      } catch (error) {
        console.error('Error initializing session:', error);
        handleBotResponse("Sorry, I couldn't start a new session. Please try refreshing the page.");
      }
    };

    initializeSession();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isSessionActive) return;
    
    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputText('');
    setIsTyping(true);
    
    try {
      const response = await fetch(`${REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({ 
          user_input: userMessage,
          session_id: sessionId
        }),
      });
      
      const data = await response.json();
      const nextSessionId = getSessionIdFromPayload(data);
      if (nextSessionId) {
        setSessionId(nextSessionId);
        setIsSessionActive(true);
      }
      
      if (data.session_expired) {
        setCurrentStep(data.step || 'destination');
        setShowSummary(false);
        setTripSummary(null);
        setFlights([]);
        setIsTyping(false);
        handleBotResponse(data.message || "Your session expired. Let's start again.");
        return;
      }
      
      // Rest of your existing handleSubmit logic
      if (data.step) {
        setCurrentStep(data.step);
      }
      
      if (data.trip_summary) {
        setTripSummary(data.trip_summary);
        setFlights(data.flights || []);
        setShowSummary(true);
      }

      setTimeout(() => {
        setIsTyping(false);
        if (!data.trip_summary) {
          handleBotResponse(data.message);
        }
      }, 1000 + Math.random() * 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      handleBotResponse("Sorry, I encountered an error. Please try again.");
    }
  };
  
  // Add bot message to chat
  const handleBotResponse = (message) => {
    setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
  };
  
  // Reset the conversation
  const handleReset = async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          session_id: sessionId
        }),
      });
      
      const data = await response.json();
      
      // Reset all states
      setMessages([]);
      setCurrentStep('destination');
      setTripSummary(null);
      setFlights([]);
      setShowSummary(false);
      
      // Get new session ID
      const nextSessionId = getSessionIdFromPayload(data);
      if (nextSessionId) {
        setSessionId(nextSessionId);
        setIsSessionActive(true);
      }
      
      setTimeout(() => {
        handleBotResponse(data.message);
      }, 500);
      
    } catch (error) {
      console.error('Error resetting conversation:', error);
      handleBotResponse("Sorry, I couldn't reset the conversation. Please refresh the page.");
    }
  };


  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Travel Planner Bot</h1>
          <button className="reset-button" onClick={handleReset}>
            <i className="fas fa-redo"></i> New Trip
          </button>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <Message key={index} message={message.text} sender={message.sender} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={showSummary ? "Ask anything about your trip..." : `Enter your ${currentStep}...`}
        disabled={false}
          />
      <button type="submit" disabled={!inputText.trim()}>
        <i className="fas fa-paper-plane"></i>
      </button>
        </form>
      </div>
      
      {showSummary && (
        <div className="summary-container">
          <div className="summary-header">
            <h2>Your Trip Summary</h2>
          </div>
          
          <div className="summary-text">
            {renderTripSummary(tripSummary)}
          </div>
          
          <div className="summary-section">
            <h3>
              <i className="fas fa-plane"></i> Available Flights
            </h3>
            <div className="cards-container">
              {flights.length > 0 ? (
                flights.map((flight, index) => (
                  <FlightCard key={index} flight={flight} />
                ))
              ) : (
                <p className="no-data">No flight information available</p>
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

export default Chat;
