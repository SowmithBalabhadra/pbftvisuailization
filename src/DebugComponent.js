import React from 'react';

function DebugComponent() {
  // Sample leader node and other nodes with angles
  const leader = { id: 1, angle: 0 };
  const nodes = [
    { id: 2, angle: Math.PI / 3 },
    { id: 3, angle: Math.PI },
    { id: 4, angle: (5 * Math.PI) / 3 },
  ];

  return (
    <div>
      {nodes.map((node) => {
        const nodeRadius = 30;

        // Define start and end points for each arrow
        const startX = window.innerWidth / 2 + (250 - nodeRadius) * Math.cos(leader.angle);
        const startY = window.innerHeight / 2 + (250 - nodeRadius) * Math.sin(leader.angle);
        const endX = window.innerWidth / 2 + (250 - nodeRadius) * Math.cos(node.angle);
        const endY = window.innerHeight / 2 + (250 - nodeRadius) * Math.sin(node.angle);

        // Calculate the distance and angle for the arrow
        const distance = Math.hypot(endX - startX, endY - startY);
        const angle = Math.atan2(endY - startY, endX - startX);

        return (
          <div
            key={`arrow-${leader.id}-${node.id}`}
            style={{
              position: 'absolute',
              top: `${startY}px`,
              left: `${startX}px`,
              width: `${distance}px`,
              transform: `rotate(${angle}rad)`,
            }}
          >
            {/* Render the arrow */}
            <div
              style={{
                width: '100%',
                height: '2px',
                backgroundColor: 'blue',
                position: 'absolute',
              }}
            ></div>

            {/* Render the message above the arrow */}
            <div
              style={{
                position: 'absolute',
                top: '-20px', // Slightly above the arrow
                left: `${distance / 2}px`, // Centered horizontally
                transform: 'translateX(-50%)',
                backgroundColor: 'red',
                color: 'white',
                padding: '5px',
                fontSize: '16px',
                zIndex: 1000,
                border: '1px solid black',
                fontWeight: 'bold',
              }}
            >
              Message to Node {node.id}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DebugComponent;
