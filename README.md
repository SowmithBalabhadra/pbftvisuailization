

# Byzantine Fault Tolerance Visualization

## Overview

This project is a simulation tool that visualizes Byzantine Fault Tolerance (BFT) in a distributed system with faulty and loyal nodes. The simulation demonstrates how nodes (generals) in a distributed system reach a consensus despite some faulty nodes that might try to disrupt the process.

It involves simulating consensus-building amongst a number of generals where faulty generals may try to mislead other generals. The simulation is conducted with the help of Byzantine Fault Tolerance protocols and with loyal nodes, which show how the former can come up to an agreement even while there are present nodes that are faulty..

---

## Features

- **Adjustable Number of Generals and Faulty Generals:** The number of generals (`numGenerals`) and faulty generals (`numFaulty`) can be set before starting the simulation.
- **Voting Phase:** Simulate the voting process where loyal generals elect a leader.
- **Proposal Phase:** The leader sends a proposal and other nodes sign it if they agree.
- **Commit Phase:** The nodes can commit and pass the message to all nodes.
- **Interactive UI:** The simulation provides an interactive visual representation of the nodes and their voting processes.
- **Next Round Simulation:** After reaching consensus, users can start a new round of simulation automatically.
  
---

## Technologies Used

- **React:** For building the user interface and handling the state management.
- **CSS:** For styling the simulation and UI components.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/<your-username>/byzantine-fault-tolerance-visualization.git
   ```

2. **Navigate into the project directory:**

  ```bash
   cd byzantine-fault-tolerance-visualization
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the app:**

   ```bash
   npm start
   ```

   This will launch the app on `http://localhost:3000`.

---

## Usage

- **Start Simulation:** Set the number of generals and faulty generals, then click the "Start Simulation" button.
- **Voting Phase:** During the simulation, the nodes will vote to elect a leader.
- **Proposal Phase:** The leader proposes a message, and other nodes sign it.
- **Next Round:** Once the consensus is reached, you can start a new round by clicking the "Next Round" button, which will reset the simulation with default values (4 generals and 1 faulty general).

---
## Buttons
- **Accept** The node can accept the Proposal and send the message to all nodes.
- **Reject** The node can reject the Proposal and no message is send.
- **View** For fault node Accept and Reject can be choosen Random.
- **Commit** The node can commit and send message to all nodes.

## Demo

Demo of how the simulation works:

1. **Start by setting the number of generals and faulty generals.**
2. **Click the "Start Simulation" button to see the nodes and their interactions.**
3. **Watch the voting phase where nodes elect a leader and engage in the consensus process.**
4. **After the consensus is reached, you can click "Next Round" to simulate a new round with the same configuration.**

---

## Contributing

Feel free to submit issues, and send pull requests if you would like to contribute to improving the visualization by adding new features.

---

## Credits

- **Developers:**
  - [B. Sowmith](https://www.linkedin.com/in/sowmith-balabhadra/)
  - [D. Hanisha](https://www.linkedin.com/in/duvvuri-hanisha-a0b376269/)

- **Mentor:**
  - [D. Mallikarjun Reddy](https://www.linkedin.com/in/mallikarjun-reddy-dorsala-12533663/)

---

