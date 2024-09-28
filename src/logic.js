Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 1,
  setup: () => ({
    carPosition: 50, // Middle of the road initially
    road: [],
    obstacles: [],
    speed: 5,  // Basic speed for moving forward
    gameOver: false,
  }),
  actions: {
    moveLeft: ({ game }) => {
      if (game.carPosition > 0) {
        game.carPosition -= 10; // Move car left
      }
    },
    moveRight: ({ game }) => {
      if (game.carPosition < 100) {
        game.carPosition += 10; // Move car right
      }
    },
  },
});
