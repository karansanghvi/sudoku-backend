const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['NORMAL', 'EASY'],
    },
    size: {
      type: Number,
      required: true,
      enum: [6, 9],
    },
    puzzle: {
      type: [[Number]],
      required: true,
    },
    solution: {
      type: [[Number]],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    userProgress:[{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        currentBoard: {
            type: [[Number]],
        },
        timeSpent: {
            type: Number,
            default: 0,
        },
        lastPlayed: {
            type: Date,
            default: Date.now,
        }
    }]
  },
  {
    timestamps: true,
  }
);

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;