import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [numGenerals, setNumGenerals] = useState(4);
  const [numFaulty, setNumFaulty] = useState(1);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [leader, setLeader] = useState(null);
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [returnToOriginal, setReturnToOriginal] = useState(false);
  const [proposal, setProposal] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [sending, setSending] = useState(false);
  const [arrowsVisible, setArrowsVisible] = useState(false);
  const [arrows, setArrows] = useState([]);
  const [MSG, setMSG] = useState("");
  const [showNextPhaseButton, setShowNextPhaseButton] = useState(false);
  const [nextPhaseStarted, setNextPhaseStarted] = useState(false);
  const [preparePhaseArrowsVisible, setPreparePhaseArrowsVisible] =
    useState(false);
  const [nodeStatuses, setNodeStatuses] = useState({});
  const [currentPhase, setCurrentPhase] = useState("Pre-prepare Phase");
  const [errorMessage, setErrorMessage] = useState("");
  const [prepareMessageCounts, setPrepareMessageCounts] = useState({});
  const [allPrepared, setAllPrepared] = useState(false);
  const [showNodeRoles, setShowNodeRoles] = useState(true);
  const [commitMessageCounts, setCommitMessageCounts] = useState({});
  const [committedNodes, setCommittedNodes] = useState([]);

  const [consensusAchieved, setConsensusAchieved] = useState(false);
  const [showNextRoundButton, setShowNextRoundButton] = useState(false);

  const [showCommitButton, setShowCommitButton] = useState(false);
  const prepareThreshold = 2 * numFaulty + 1;
  const commitThreshold = 2 * numFaulty + 1;

  useEffect(() => {
    if (
      Object.values(prepareMessageCounts).every(
        (count) => count >= prepareThreshold
      )
    ) {
      setAllPrepared(true);
    } else {
      setAllPrepared(false);
    }
  }, [prepareMessageCounts, prepareThreshold]);

  useEffect(() => {
    if (consensusAchieved) {
      setShowNextRoundButton(true);
    }
  }, [consensusAchieved]);

  const NODE_RADIUS = 30;

  const handleSimulationStart = () => {
    if (numGenerals < 3 * numFaulty + 1) {
      setErrorMessage(
        "Invalid configuration: The number of generals must be at least 3 times the number of faulty nodes plus 1."
      );
      return;
    }

    setErrorMessage("");
    setLoading(true);

    setTimeout(() => {
      const angleIncrement = (2 * Math.PI) / numGenerals;
      const newNodes = Array.from({ length: numGenerals }, (_, i) => ({
        id: i + 1,
        type: i < numFaulty ? "Faulty" : "Loyal",
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
      const loyalGenerals = nodes.filter((node) => node.type === "Loyal");
      const randomLeader =
        loyalGenerals[Math.floor(Math.random() * loyalGenerals.length)];

      setLeader(randomLeader.id);
      setIsVoting(false);
      setReturnToOriginal(true);

      setTimeout(() => {
        const leftNode = visibleNodes.find((node) => node.angle === Math.PI);
        const leaderNode = visibleNodes.find(
          (node) => node.id === randomLeader.id
        );

        if (leaderNode && leftNode) {
          const tempAngle = leftNode.angle;
          leftNode.angle = leaderNode.angle;
          leaderNode.angle = tempAngle;

          setVisibleNodes([...visibleNodes]);
          setReturnToOriginal(false);
        }
      }, 1000);
    }, 4000);
  };

  const resetNodeStates = () => {
    setNodeStatuses({});
  };

  const handlePropose = () => {
    setShowProposal(true);
  };

  const handleSend = () => {
    if (proposal === "" || !isSigned) {
      setErrorMessage("reguired");
      return; 
    }

   
    setSending(true);
    setMSG(proposal);

    const leaderNode = visibleNodes.find((node) => node.id === leader);
    if (leaderNode) {
      visibleNodes.forEach((node) => {
        if (node.id !== leaderNode.id) {
          const arrowId = `${leaderNode.id}-${node.id}-preprepare`;
          setArrows((prev) => [
            ...prev,
            { id: arrowId, content: `<pre-prepare ${proposal}> sign` },
          ]);
        }
      });
    }
    setErrorMessage("");

   
    setTimeout(() => {
      setSending(false);
      setShowProposal(false);
      setProposal("");
      setIsSigned(false); 
      setArrowsVisible(true);
      setShowNextPhaseButton(true);
    }, 3000);
  };

  const handleNextPhase = () => {
    setShowNextPhaseButton(false);
    setArrows([]);
    setArrowsVisible(false);
    setPreparePhaseArrowsVisible(true);
    setNextPhaseStarted(true);
    setCurrentPhase("Prepare Phase");
    setShowCommitButton(false);

    const initialCounts = visibleNodes.reduce((counts, node) => {
      counts[node.id] = node.id === leader ? 0 : 1;
      return counts;
    }, {});
    setPrepareMessageCounts(initialCounts);
  };

  const handleAccept = (nodeId) => {
    const senderNode = visibleNodes.find((node) => node.id === nodeId);
    if (senderNode) {
      const newArrows = visibleNodes
        .filter((node) => node.id !== senderNode.id)
        .map((node) => ({
          id: `${senderNode.id}-${node.id}-prepare`,
          content: "<prepare MSG> sign",
        }));
      setArrows((prevArrows) => [...prevArrows, ...newArrows]);
      setPreparePhaseArrowsVisible(true);

      setPrepareMessageCounts((prevCounts) => {
        const updatedCounts = { ...prevCounts };
        visibleNodes.forEach((node) => {
          if (node.id !== senderNode.id) {
            updatedCounts[node.id] = (updatedCounts[node.id] || 0) + 1;
          }
        });
        return updatedCounts;
      });
    }

    setNodeStatuses((prevStatuses) => ({
      ...prevStatuses,
      [nodeId]: "accepted",
    }));
  };

  const handleReject = (nodeId) => {
    setNodeStatuses((prevStatuses) => ({
      ...prevStatuses,
      [nodeId]: "rejected",
    }));
  };

  const startNextRound = () => {
    setConsensusAchieved(false); 
    setCurrentPhase("Voting Phase"); 
    setProposal("");
    setLeader(null); 
    setAllPrepared(false); 
    setShowNodeRoles(true); 
    setCommittedNodes([]); 
    setCommitMessageCounts({}); 
    setVisibleNodes([]);
    setSimulationStarted(false); 
  };

  const handleFaultyDecision = (nodeId) => {
    const decision = Math.random() > 0.4 ? "accepted" : "rejected";
    if (decision === "accepted") {
      handleAccept(nodeId);
    } else {
      handleReject(nodeId);
    }
  };
  const handleNextButtonClick = () => {
    setArrows([]); 
    setPreparePhaseArrowsVisible(false); 
    setAllPrepared(false); 
    resetNodeStates(); 
    setShowCommitButton(true);
    setShowNodeRoles(false); 
    setCurrentPhase("Commit Phase"); 
  };

  const handleCommit = (nodeId) => {
    const committingNode = visibleNodes.find((node) => node.id === nodeId);
    if (committingNode) {
      const newCommitArrows = visibleNodes
        .filter((node) => node.id !== committingNode.id)
        .map((node) => ({
          id: `${committingNode.id}-${node.id}-commit`,
          content: `<commit, ${MSG}> sign`,
        }));

      setArrows((prevArrows) => [...prevArrows, ...newCommitArrows]);
      setPreparePhaseArrowsVisible(true);

 
      setCommitMessageCounts((prevCounts) => {
        const updatedCounts = { ...prevCounts };
        visibleNodes.forEach((node) => {
          if (node.id !== committingNode.id) {
            updatedCounts[node.id] = (updatedCounts[node.id] || 0) + 1;
          }
        });
        return updatedCounts;
      });

      setCommittedNodes((prevCommittedNodes) => {
        const newCommittedNodes = [...prevCommittedNodes, nodeId];
        if (newCommittedNodes.length === nodes.length) {
          setConsensusAchieved(true); 
        }
        return newCommittedNodes;
      });
    }
  };

  const consensusProbability =
    ((nodes.length - numFaulty) / nodes.length) * 100;

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
          {errorMessage && (
            <div className="error-message">
              Invalid N {">"}= 3F+1 was not satisfied
            </div>
          )}
          <button className="start-button" onClick={handleSimulationStart}>
            {loading ? "Preparing Simulation..." : "Start Simulation"}
          </button>
          {loading && <div className="loading-spinner"></div>}
          <div class="credits">
          
           
            <span class="at-symbol">@Credits</span>
            <a href="https://www.linkedin.com/in/sowmith-balabhadra/" class="credit-name">
              B.Sowmith
            </a>
            ,
            <a href="https://www.linkedin.com/in/duvvuri-hanisha-a0b376269/" class="credit-name">
              D.Hanisha
            </a>
            <br/>
            <span class="at-symbol">@Mentor</span>
            <a href="https://www.linkedin.com/in/mallikarjun-reddy-dorsala-12533663/" class="credit-name">
            D.Mallikarjun Reddy
            </a>
          </div>
        </div>
      ) : (
        <div className="simulation-container">
          <div className="probability-meter">
            <div className="meter-label">Consensus Probability</div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${consensusProbability}%`,
                  backgroundColor:
                    consensusProbability > 70 ? "#4CAF50" : "#FF5252",
                }}
              ></div>
            </div>
            <div className="meter-value">
              {consensusProbability.toFixed(2)}%
            </div>
          </div>

          {(sending || arrowsVisible || nextPhaseStarted) && (
            <div className="phase-title">{currentPhase}</div>
          )}

          <div
            className={`simulation-wrapper ${isVoting ? "spin" : ""} ${
              returnToOriginal ? "reset-position" : ""
            }`}
          >
            {visibleNodes.map((node) => (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  top: `${
                    window.innerHeight / 2 +
                    (isVoting ? 80 : 250) * Math.sin(node.angle) -
                    30
                  }px`,
                  left: `${
                    window.innerWidth / 2 +
                    (isVoting ? 80 : 250) * Math.cos(node.angle) -
                    30
                  }px`,
                  display: "flex",
                  alignItems: "center",
                  flexDirection:
                    node.angle > Math.PI / 2 && node.angle < (3 * Math.PI) / 2
                      ? "row-reverse"
                      : "row",
                  gap: "8px",
                  transition: "top 1s ease, left 1s ease, transform 1s ease",
                }}
              >
                <div
                  className="node"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "3px solid white",
                    backgroundColor:
                      node.id === leader
                        ? "#FFD700"
                        : node.type === "Loyal"
                        ? "#4CAF50"
                        : "#FF5252",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
                    transition: "transform 1s ease",
                  }}
                >
                  {node.id}
                  {/* Display node role conditionally */}
                  {showNodeRoles && (
                    <div
                      className="node-label"
                      style={{ opacity: leader !== null ? 1 : 0 }}
                    >
                      {node.id === leader ? "Primary" : "Replicate"}
                    </div>
                  )}
                </div>
                {nextPhaseStarted && (
                  <div>
                    <span
                      style={{
                        position: "absolute",
                        top: node.id === leader ? "-28px" : "-10px",
                        right: node.id === leader ? "80px" : "-20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "50%",
                        fontSize: "12px",
                        fontWeight: "bold",
                        zIndex: 1,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {prepareMessageCounts[node.id]}
                    </span>

                    {prepareMessageCounts[node.id] >= prepareThreshold && (
                      <span
                        style={{
                          position: "absolute",
                          top: node.id === leader ? "-30px" : "65px",
                          left: node.id === leader ? "35px" : "30px",
                          transform: "translateX(-50%)",
                          backgroundColor: "#28a745",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        Prepared
                      </span>
                    )}
                    {showCommitButton && commitMessageCounts[node.id] > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: node.id === leader ? "-30px" : "-13px",
                          right: node.id === leader ? "113px" : "-55px",
                          backgroundColor: "#ff9800",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "50%",
                          fontSize: "12px",
                          fontWeight: "bold",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {commitMessageCounts[node.id]}
                      </span>
                    )}
                  </div>
                )}

                {nextPhaseStarted &&
                  leader !== null &&
                  node.id !== leader &&
                  !showCommitButton && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {nodeStatuses[node.id] === "accepted" ? (
                        <span>Accepted</span>
                      ) : nodeStatuses[node.id] === "rejected" ? (
                        <span>Rejected</span>
                      ) : node.type === "Faulty" ? (
                        <button
                          onClick={() => handleFaultyDecision(node.id)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "10px",
                            backgroundColor: "#FF9800",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#FB8C00")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "#FF9800")
                          }
                        >
                          View
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAccept(node.id)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "10px",
                              backgroundColor: "#4CAF50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.backgroundColor = "#45a049")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.backgroundColor = "#4CAF50")
                            }
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(node.id)}
                            style={{
                              padding: "4px 8px",
                              fontSize: "10px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.backgroundColor = "#d32f2f")
                            }
                            onMouseOut={(e) =>
                              (e.target.style.backgroundColor = "#f44336")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}

                {showCommitButton &&
                  (committedNodes.includes(node.id) ? (
                    <span
                      style={{
                        padding: "4px 8px",
                        fontSize:
                          commitMessageCounts[node.id] >= commitThreshold
                            ? "13px"
                            : "10px",
                        backgroundColor:
                          commitMessageCounts[node.id] >= commitThreshold
                            ? "#28a745"
                            : "orange",
                        color: "white",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        marginTop: node.id === leader ? "-35px" : "5px",
                        position: node.id === leader ? "absolute" : "relative",
                        top: node.id === leader ? "50px" : "0",
                        left: node.id === leader ? "-40px" : "0",
                        transform:
                          node.id === leader ? "translateX(-50%)" : "none",
                      }}
                    >
                      Committed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCommit(node.id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: node.id === leader ? "-35px" : "5px",
                        position: node.id === leader ? "absolute" : "relative",
                        top: node.id === leader ? "50px" : "0",
                        left: node.id === leader ? "-35px" : "0",
                        transform:
                          node.id === leader ? "translateX(-50%)" : "none",
                      }}
                    >
                      Commit
                    </button>
                  ))}
              </div>
            ))}

            {(arrowsVisible || preparePhaseArrowsVisible) &&
              arrows.map(({ id: arrowId, content }) => {
                const [senderId, receiverId] = arrowId.split("-").map(Number);
                const senderNode = visibleNodes.find((n) => n.id === senderId);
                const receiverNode = visibleNodes.find(
                  (n) => n.id === receiverId
                );

                if (!senderNode || !receiverNode) return null;

                const angle = Math.atan2(
                  window.innerHeight / 2 +
                    250 * Math.sin(receiverNode.angle) -
                    (window.innerHeight / 2 + 250 * Math.sin(senderNode.angle)),
                  window.innerWidth / 2 +
                    250 * Math.cos(receiverNode.angle) -
                    (window.innerWidth / 2 + 250 * Math.cos(senderNode.angle))
                );

                const startX =
                  window.innerWidth / 2 +
                  (250 - NODE_RADIUS) * Math.cos(senderNode.angle);
                const startY =
                  window.innerHeight / 2 +
                  (250 - NODE_RADIUS) * Math.sin(senderNode.angle);
                const endX =
                  window.innerWidth / 2 +
                  (250 - NODE_RADIUS) * Math.cos(receiverNode.angle);
                const endY =
                  window.innerHeight / 2 +
                  (250 - NODE_RADIUS) * Math.sin(receiverNode.angle);

                const textRotation =
                  angle > Math.PI / 2 || angle < -Math.PI / 2
                    ? angle + Math.PI
                    : angle;

                return (
                  <React.Fragment key={`arrow-${senderId}-${receiverId}`}>
                    <div
                      className="arrow-container"
                      style={{
                        position: "absolute",
                        top: `${startY}px`,
                        left: `${startX}px`,
                        width: `${Math.hypot(endX - startX, endY - startY)}px`,
                        transform: `rotate(${angle}rad)`,
                      }}
                    >
                      <div className="arrow"></div>
                    </div>
                    <div
                      className="arrow-msg fade-in"
                      style={{
                        position: "absolute",
                        top: `${(startY + endY) / 2 - 45}px`,
                        left: `${(startX + endX) / 2}px`,
                        transform: `translateX(-50%) rotate(${textRotation}rad)`,
                      }}
                    >
                      {content}
                    </div>
                  </React.Fragment>
                );
              })}
          </div>

          {!isVoting && leader === null && (
            <button className="voting-button" onClick={handleVoting}>
              Voting
            </button>
          )}

          {!nextPhaseStarted &&
            leader !== null &&
            !showProposal &&
            !sending &&
            !arrowsVisible && (
              <button className="propose-button" onClick={handlePropose}>
                Propose
              </button>
            )}

          {showProposal && (
            <div className="proposal-container">
              {/* Input field for the proposal text */}

              <input
                className="proposal-input"
                type="text"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Enter proposal text"
                required
              />

              {/* Checkbox for signing */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => setIsSigned(e.target.checked)}
                  required
                />
                Sign
              </label>

            
              {errorMessage && (
                <div style={{ color: "red", marginTop: "10px" }}>
                  {errorMessage}
                </div>
              )}
              {/* Send Button */}
              <button className="send-button" onClick={handleSend}>
                Send
              </button>
            </div>
          )}

          {showNextPhaseButton && (
            <button
              className="next-phase-button"
              onClick={handleNextPhase}
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Next Phase
            </button>
          )}

          {allPrepared && !isVoting && currentPhase === "Prepare Phase" && (
            <button
              className="next-phase-button"
              onClick={() => {
                handleNextButtonClick();
                setAllPrepared(false); 
              }}
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Next
            </button>
          )}

          <button
            className="replay-button"
            onClick={() => window.location.reload()}
          >
            Replay
          </button>
          <div class="credits">
            
            <span class="at-symbol">@Credits</span>
            <a href="https://www.linkedin.com/in/sowmith-balabhadra/" class="credit-name">
            B.Sowmith
            </a>
            ,
            <a href="https://www.linkedin.com/in/duvvuri-hanisha-a0b376269/" class="credit-name">
            D.Hanisha
            </a>
            <br/>
            <span class="at-symbol">@Mentor</span>
            <a href="https://www.linkedin.com/in/mallikarjun-reddy-dorsala-12533663/" class="credit-name">
            D.Mallikarjun Reddy
            </a>
          </div>
        </div>
      )}
      {consensusAchieved && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h1>🎉 Consensus Achieved! 🎉</h1>
            <p>{`Proposal: ${proposal}`}</p>
            <button onClick={() => setConsensusAchieved(false)}>Close</button>
          </div>
        </div>
      )}

      {showNextRoundButton && (
  <button
    onClick={() => {
      // Set the default values for numGenerals and numFaulty
      
      
      // Reload the page
      window.location.reload();
      setNumGenerals(4);
      setNumFaulty(1);
      handleSimulationStart();
      
      
      setShowNextRoundButton(false);
      setConsensusAchieved(false);
    }}
    style={{
      position: "absolute",
      bottom: "20px",
      right: "20px",
      padding: "10px 20px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
    }}
  >
    Next Round
  </button>
)}

    </div>
  );
}

export default App;
