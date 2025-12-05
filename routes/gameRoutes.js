const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { protect } = require('../middleware/auth');
const { generateNormalBoard, generateEasyBoard, generateGameName } = require('../utils/sudokuGenerator');

// create a new game 
router.post('/', protect, async (req, res) => {
  try {
    const { difficulty } = req.body;

    if (!difficulty || !['NORMAL', 'EASY'].includes(difficulty.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Please provide valid difficulty: NORMAL or EASY' 
      });
    }

    let puzzleData;
    let size;

    if (difficulty.toUpperCase() === 'NORMAL') {
      puzzleData = generateNormalBoard();
      size = 9;
    } else {
      puzzleData = generateEasyBoard();
      size = 6;
    }

    let gameName = generateGameName();
    
    let nameExists = await Game.findOne({ name: gameName });
    while (nameExists) {
      gameName = generateGameName();
      nameExists = await Game.findOne({ name: gameName });
    }

    const game = await Game.create({
      name: gameName,
      difficulty: difficulty.toUpperCase(),
      size: size,
      puzzle: puzzleData.puzzle,
      solution: puzzleData.solution,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Game created successfully',
      game: {
        id: game._id,
        name: game.name,
        difficulty: game.difficulty,
        size: game.size,
        createdAt: game.createdAt,
      },
    });

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ 
      error: 'Error creating game',
      details: error.message 
    });
  }
});

// get list of all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find()
      .populate('createdBy', 'emailAddress')
      .select('name difficulty size createdAt createdBy completedBy')
      .sort({ createdAt: -1 });

    const formattedGames = games.map(game => ({
      id: game._id,
      name: game.name,
      difficulty: game.difficulty,
      size: game.size,
      createdBy: game.createdBy ? game.createdBy.emailAddress : 'Unknown',
      createdAt: game.createdAt,
      completedCount: game.completedBy.length,
    }));

    res.status(200).json({
      games: formattedGames,
      count: formattedGames.length,
    });

  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ 
      error: 'Error fetching games',
      details: error.message 
    });
  }
});

// get specific game details 
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId)
      .populate('createdBy', 'emailAddress')
      .populate('completedBy', 'emailAddress');

    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found' 
      });
    }

    let userProgress = null;
    let isCompleted = false;

    if (req.cookies.token) {
        try {
            const User = require('../models/User');
            const userId = req.cookies.token;

            isCompleted = game.completedBy.some(id => id.toString() === userId);

            const progress = game.userProgress.find(
                p => p.userId.toString() === userId
            );

            if (progress) {
                userProgress = {
                    currentBoard: progress.currentBoard,
                    timeSpent: progress.timeSpent
                };
            }
        } catch (err) {
            console.error('Error fetching user progress:', err);
        }
    }

    res.status(200).json({
      game: {
        id: game._id,
        name: game.name,
        difficulty: game.difficulty,
        size: game.size,
        puzzle: game.puzzle,
        solution: game.solution,
        createdBy: game.createdBy ? game.createdBy.emailAddress : 'Unknown',
        createdAt: game.createdAt,
        completedBy: game.completedBy.map(user => user.emailAddress),
        userProgress,
        isCompleted
      },
    });

  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ 
      error: 'Error fetching game',
      details: error.message 
    });
  }
});

// save user progress (must be before /:gameId)
router.put('/:gameId/progress', protect, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { currentBoard, timeSpent } = req.body;

    console.log('📥 Progress save request received for game:', gameId); // Debug log

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const progressIndex = game.userProgress.findIndex(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (progressIndex >= 0) {
      game.userProgress[progressIndex].currentBoard = currentBoard;
      game.userProgress[progressIndex].timeSpent = timeSpent;
      game.userProgress[progressIndex].lastPlayed = new Date();
    } else {
      game.userProgress.push({
        userId: req.user._id,
        currentBoard,
        timeSpent,
        lastPlayed: new Date()
      });
    }

    await game.save();

    console.log('Progress saved successfully'); 

    res.status(200).json({
      message: 'Progress saved successfully'
    });

  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ 
      error: 'Error saving progress',
      details: error.message 
    });
  }
});

// update game (mark as completed)
router.put('/:gameId', protect, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { completed } = req.body;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found' 
      });
    }

    if (completed) {
      if (!game.completedBy.includes(req.user._id)) {
        game.completedBy.push(req.user._id);
        await game.save();

        req.user.gamesWon += 1;
        await req.user.save();
      }
    }

    res.status(200).json({
      message: 'Game updated successfully',
      game: {
        id: game._id,
        completedBy: game.completedBy,
      },
    });

  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ 
      error: 'Error updating game',
      details: error.message 
    });
  }
});

// delete a game 
router.delete('/:gameId', protect, async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ 
        error: 'Game not found' 
      });
    }

    if (game.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'You can only delete games you created' 
      });
    }

    await Game.findByIdAndDelete(gameId);

    res.status(200).json({
      message: 'Game deleted successfully',
    });

  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ 
      error: 'Error deleting game',
      details: error.message 
    });
  }
});

module.exports = router;