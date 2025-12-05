const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');

// get leaderboard of users sorted by games won
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ gamesWon: { $gt: 0 } })
      .select('emailAddress gamesWon')
      .sort({ gamesWon: -1, emailAddress: 1 }); 

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.emailAddress,
      gamesWon: user.gamesWon
    }));

    res.status(200).json({
      leaderboard,
      count: leaderboard.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: 'Error fetching leaderboard',
      details: error.message 
    });
  }
});

// get list of games sorted by number of completions
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find({ 
      $expr: { $gt: [{ $size: '$completedBy' }, 0] } 
    })
      .populate('createdBy', 'emailAddress')
      .select('name difficulty size completedBy createdBy createdAt')
      .sort({ 'completedBy': -1 }); 

    const sortedGames = games
      .sort((a, b) => b.completedBy.length - a.completedBy.length)
      .map((game, index) => ({
        rank: index + 1,
        id: game._id,
        name: game.name,
        difficulty: game.difficulty,
        size: game.size,
        createdBy: game.createdBy ? game.createdBy.emailAddress : 'Unknown',
        completionCount: game.completedBy.length
      }));

    res.status(200).json({
      games: sortedGames,
      count: sortedGames.length
    });

  } catch (error) {
    console.error('Get game leaderboard error:', error);
    res.status(500).json({ 
      error: 'Error fetching game leaderboard',
      details: error.message 
    });
  }
});

// get highscore details for a specific game
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId)
      .populate('completedBy', 'emailAddress')
      .select('name difficulty completedBy');

    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found' 
      });
    }

    const completers = game.completedBy.map(user => ({
      username: user.emailAddress
    }));

    res.status(200).json({
      game: {
        id: game._id,
        name: game.name,
        difficulty: game.difficulty,
        completionCount: completers.length,
        completedBy: completers
      }
    });

  } catch (error) {
    console.error('Get game highscore error:', error);
    res.status(500).json({ 
      error: 'Error fetching game highscore',
      details: error.message 
    });
  }
});

module.exports = router;