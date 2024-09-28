import { useEffect, useState } from "react";

function App() {
  // Declare game state
  const [game, setGame] = useState({
    carPosition: 50, // Center of the road (0-100 scale for percentage positioning)
    road: Array(10).fill(0),
    obstacles: [],
  });

  const [yourPlayerId, setYourPlayerId] = useState();
  const [isGameOver, setIsGameOver] = useState(false);

  // Handle car movement with keyboard
  const handleKeyDown = (e) => {
    const { carPosition } = game;

    // Move car left or right based on key pressed
    if (e.key === "ArrowLeft" && carPosition > 0) {
      setGame((prevGame) => ({
        ...prevGame,
        carPosition: prevGame.carPosition - 5, // Move left by 5%
      }));
    } else if (e.key === "ArrowRight" && carPosition < 100) {
      setGame((prevGame) => ({
        ...prevGame,
        carPosition: prevGame.carPosition + 5, // Move right by 5%
      }));
    }
  };

  // Generate random obstacles at regular intervals
  useEffect(() => {
    const generateObstacle = () => {
      setGame((prevGame) => ({
        ...prevGame,
        obstacles: [
          ...prevGame.obstacles,
          { position: Math.random() * 100, top: 0 }, // Random horizontal position and starting at the top
        ],
      }));
    };

    const obstacleInterval = setInterval(generateObstacle, 2000); // Generate new obstacle every 2 seconds

    return () => clearInterval(obstacleInterval); // Cleanup the interval when component unmounts
  }, []);

  // Move obstacles downwards
  useEffect(() => {
    const moveObstacles = () => {
      setGame((prevGame) => ({
        ...prevGame,
        obstacles: prevGame.obstacles.map((obstacle) => ({
          ...obstacle,
          top: obstacle.top + 5, // Move the obstacle down by 5% per frame
        })).filter((obstacle) => obstacle.top < 100), // Remove obstacles that are off-screen
      }));
    };

    const obstacleMoveInterval = setInterval(moveObstacles, 100); // Move obstacles every 100ms

    return () => clearInterval(obstacleMoveInterval); // Cleanup interval
  }, [game.obstacles]);

  // Function to generate road segments
  const generateRoad = () => {
    const roadSegment = { position: 0 }; // New road segment starts at the top
    setGame((prevGame) => ({
      ...prevGame,
      road: [...prevGame.road, roadSegment], // Add new road segment to the array
    }));
  };

  // Function to move road segments down
  const moveRoad = () => {
    setGame((prevGame) => ({
      ...prevGame,
      road: prevGame.road.map((segment) => ({
        ...segment,
        position: segment.position + 5, // Move each segment down by 5 units
      })).filter(segment => segment.position < 100) // Remove segments that have moved off-screen
    }));
  };

  // Add event listener for keydown to move the car
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Clean up listener
    };
  }, [game]);

  // Initialize Rune client and listen for game changes
  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, yourPlayerId }) => {
        setGame(game || {
          carPosition: 50,
          road: Array(10).fill(0),
          obstacles: []
        });
        setYourPlayerId(yourPlayerId);
      },
    });
    
    // Generate road segments every second
    const roadInterval = setInterval(() => {
      generateRoad();
      moveRoad();
    }, 100);

    // Clean up road interval
    return () => clearInterval(roadInterval);

  }, []);

  // Collision detection function
  const checkCollision = () => {
    const carLeft = game.carPosition; // Player's car left position
    const carRight = game.carPosition + 4; // Car width is 40px (4% in the 100% width)
    const carTop = 90; // Car's vertical position (near bottom)

    // Check for collision with each obstacle
    for (let obstacle of game.obstacles) {
      const obstacleLeft = obstacle.position; // Obstacle's left position
      const obstacleRight = obstacle.position + 4; // Assuming obstacle width is 40px (4% in the 100% width)
      const obstacleTop = obstacle.top; // Obstacle's vertical position

      // Check for overlap in horizontal and vertical axes
      if (
        carLeft < obstacleRight &&
        carRight > obstacleLeft &&
        carTop < obstacleTop + 10 && // Assuming obstacle height is 100px (10% in the 100% height)
        obstacleTop < carTop + 7 // Car height is 70px (7% in the 100% height)
      ) {
        return true; // Collision detected
      }
    }

    return false; // No collision detected
  };

  // Move obstacles and check for collisions
  useEffect(() => {
    const moveObstacles = () => {
      setGame((prevGame) => {
        const updatedObstacles = prevGame.obstacles.map((obstacle) => ({
          ...obstacle,
          top: obstacle.top + 5,
        })).filter((obstacle) => obstacle.top < 100); // Keep only on-screen obstacles

        // Check for collisions
        if (checkCollision()) {
          setIsGameOver(true); // Set game over state
          clearInterval(obstacleMoveInterval); // Stop moving obstacles if game over
        }

        return {
          ...prevGame,
          obstacles: updatedObstacles,
        };
      });
    };

    const obstacleMoveInterval = setInterval(moveObstacles, 100); // Move obstacles every 100ms

    return () => clearInterval(obstacleMoveInterval); // Cleanup interval
  }, [game.obstacles]);

  if (!game || !Array.isArray(game.road) || !Array.isArray(game.obstacles)) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Render game over message if applicable
  if (isGameOver) {
    return <div className="game-over">Game Over! Refresh to play again.</div>;
  }

  // Game elements go here
  return (
    <div className="game-container" onKeyDown={handleKeyDown} tabIndex="0">
      <h1>Road Fighter Retro</h1>
      <div className="road">
        {/* Render the player's car */}
        <div
          className="car"
          style={{ left: `${game.carPosition}%` }}
        ></div>

        {/* Render road segments */}
        {game.road.map((segment, index) => (
          <div
            key={index}
            className="road-segment"
            style={{ top: `${segment.position}%` }} // Move road segments down
          ></div>
        ))}

        {/* Render obstacles */}
        {game.obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="obstacle"
            style={{
              left: `${obstacle.position}%`,
              top: `${obstacle.top}%`,
            }}
            ></div>
        ))}
      </div>
    </div>
  );
}

export default App;