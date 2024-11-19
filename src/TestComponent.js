import React, { useState, useEffect } from 'react';
import './App.css';
function App() {
  const [numGenerals, setNumGenerals] = useState(4);
  const [numFaulty, setNumFaulty] = useState(0);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [leader, setLeader] = useState(null);
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [returnToOriginal, setReturnToOriginal] = useState(false);
  const [proposal, setProposal] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [sending, setSending] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(false);
  const [MSG, setMSG] = useState(''); // Stores the proposal text

  const handleSimulationStart = () => {
    setLoading(true);

    setTimeout(() => {
      const angleIncrement = (2 * Math.PI) / numGenerals;
      const newNodes = Array.from({ length: numGenerals }, (_, i) => ({
        id: i + 1,
        type: i < numFaulty ? 'Faulty' : 'Loyal',
        angle: angleIncrement * i,
      }));
      setNodes(newNodes);
      setLoading(false);
      setSimulationStarted(true);

      newNodes.forEach((node, index) => {
        setTimeout(() => {
          setVisibleNodes((prev) => [...prev, node]);
        }, index * 500);
      });
    }, 2000);
  };

  const handleVoting = () => {
    setIsVoting(true);

    setTimeout(() => {
      const loyalGenerals = nodes.filter((node) => node.type === 'Loyal');
      const randomLeader = loyalGenerals[Math.floor(Math.random() * loyalGenerals.length)];

      setLeader(randomLeader.id);
      setIsVoting(false);
      setReturnToOriginal(true);

      setTimeout(() => {
        const leftNode = visibleNodes.find((node) => node.angle === Math.PI);
        const leaderNode = visibleNodes.find((node) => node.id === randomLeader.id);

        if (leaderNode && leftNode) {
          const tempAngle = leftNode.angle;
          leftNode.angle = leaderNode.angle;
          leaderNode.angle = tempAngle;

          setVisibleNodes([...visibleNodes]);
          setReturnToOriginal(false);
        }
      }, 1000);
    }, 6000);
  };

  const handlePropose = () => {
    setShowProposal(true);
  };

  const handleSend = () => {
    setSending(true);
    setMSG(proposal); // Store proposal text in MSG

    // Display the arrows after sending
    setTimeout(() => {
      setSending(false);
      setShowProposal(false);
      setProposal('');
      setIsSigned(false);
      setArrowsVisible(true); // Arrows remain visible
    }, 3000); // Duration of the arrow animation
  };

  // Calculate probability of consensus based on loyal nodes
  const consensusProbability = ((nodes.length - numFaulty) / nodes.length) * 100;

  return (
    <div>
    
      {!simulationStarted ? (
        <div className="input-container">
          <h1>Byzantine Fault Tolerance Visualization</h1>
          <div className="input-wrapper">
            <label>Number of Generals: </label>
            <input
              className="input-field"
              type="number"
              value={numGenerals}
              onChange={(e) => setNumGenerals(parseInt(e.target.value))}
            />
          </div>
          <div className="input-wrapper">
            <label>Number of Faulty Generals: </label>
            <input
              className="input-field"
              type="number"
              value={numFaulty}
              onChange={(e) => setNumFaulty(parseInt(e.target.value))}
            />
          </div>
          <button className="start-button" onClick={handleSimulationStart}>
            {loading ? 'Preparing Simulation...' : 'Start Simulation'}
          </button>
          {loading && <div className="loading-spinner"></div>}
        </div>
      ) : (
        <div className="simulation-container">
          {/* Probability Meter */}
          <div className="probability-meter">
            <div className="meter-label">Consensus Probability</div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${consensusProbability}%`,
                  backgroundColor: consensusProbability > 70 ? '#4CAF50' : '#FF5252',
                }}
              ></div>
            </div>
            <div className="meter-value">{consensusProbability.toFixed(2)}%</div>
          </div>

          {/* Display Pre-prepare Phase Title */}
          {(sending || arrowsVisible) && <div className="phase-title">Pre-prepare Phase</div>}

          <div className={`simulation-wrapper ${isVoting ? 'spin' : ''} ${returnToOriginal ? 'reset-position' : ''}`}>
            {visibleNodes.map((node) => (
              <div
                key={node.id}
                className="node"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '3px solid white',
                  backgroundColor: node.id === leader ? '#FFD700' : node.type === 'Loyal' ? '#4CAF50' : '#FF5252',
                  position: 'absolute',
                  top: `${window.innerHeight / 2 + (isVoting ? 80 : 250) * Math.sin(node.angle) - 30}px`,
                  left: `${window.innerWidth / 2 + (isVoting ? 80 : 250) * Math.cos(node.angle) - 30}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.2)',
                  opacity: 1,
                  transition: 'top 1s ease, left 1s ease, transform 2s ease',
                }}
              >
                {node.id}
                <div className="node-label" style={{ opacity: leader !== null ? 1 : 0 }}>
                  {node.id === leader ? 'Primary' : 'Replicate'}
                </div>
              </div>
            ))}

            {/* Arrows moving from leader to each replica with MSG */}
            {arrowsVisible &&
  visibleNodes
    .filter((node) => node.id !== leader) // Exclude the leader node itself
    .map((node) => {
      const leaderNode = visibleNodes.find((n) => n.id === leader);
      if (!leaderNode) return null;

      const nodeRadius = 30;

      // Calculate start and end positions for arrows
      const startX = window.innerWidth / 2 + (250 - nodeRadius) * Math.cos(leaderNode.angle);
      const startY = window.innerHeight / 2 + (250 - nodeRadius) * Math.sin(leaderNode.angle);
      const endX = window.innerWidth / 2 + (250 - nodeRadius) * Math.cos(node.angle);
      const endY = window.innerHeight / 2 + (250 - nodeRadius) * Math.sin(node.angle);

      // Calculate the distance and angle for the arrow container
      const distance = Math.hypot(endX - startX, endY - startY);
      const angle = Math.atan2(endY - startY, endX - startX);

      return (
        <React.Fragment key={`arrow-${leaderNode.id}-${node.id}`}>
          {/* Arrow Container */}
          <div
            className="arrow-container"
            style={{
              position: 'absolute',
              top: `${startY}px`,
              left: `${startX}px`,
              width: `${distance}px`,
              transform: `rotate(${angle}rad)`,
              zIndex: 5,
            }}
          >
            <div className="arrow" style={{ height: '2px', backgroundColor: '#0072b1', width: '100%' }}></div>
          </div>

          {/* Separate Message Container with Rotation */}
          <div
            className="arrow-msg"
            style={{
              position: 'absolute',
              top: `${(startY + endY) / 2 - 35}px`, // Position above the midpoint of the arrow
              left: `${(startX + endX) / 2}px`, // Center it horizontally at the midpoint
              transform: `translateX(-50%) rotate(${angle}rad)`, // Apply rotation based on angle
              whiteSpace: 'nowrap',
              zIndex: 1000, // High z-index to ensure it appears on top
              color: '#000000', // Dark color for maximum contrast
              backgroundColor: '#ffffff', // White background for visibility
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid #cccccc',
              fontWeight: 'bold',
             
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Shadow to improve readability
            }}
          >
            
         {`<pre-prepare ${MSG}> ${isSigned ? 'sign' : 'no sign'}`}

          </div>
        </React.Fragment>
      );
    })}






          </div>

          {!isVoting && leader === null && (
            <button className="voting-button" onClick={handleVoting}>Voting</button>
          )}

          {leader !== null && !showProposal && !sending && !arrowsVisible && (
            <button className="propose-button" onClick={handlePropose}>Propose</button>
          )}

          {/* Proposal Input and Send button */}
          {showProposal && (
            <div className="proposal-container">
              <input
                className="proposal-input"
                type="text"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Enter proposal text"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => setIsSigned(e.target.checked)}
                  
                />
                Sign
              </label>
              <button className="send-button" onClick={handleSend}>Send</button>
             
            </div>
          )}

          {/* Replay Button */}
          <button className="replay-button" onClick={() => window.location.reload()}>Replay</button>
        </div>
      )}
    </div>
  );
}

export default App;
