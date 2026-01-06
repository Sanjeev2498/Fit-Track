import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private
const createChallenge = async (req, res) => {
  try {
    const challengeData = {
      ...req.body,
      creator: req.user._id
    };

    // Validate dates
    const startDate = new Date(challengeData.duration.startDate);
    const endDate = new Date(challengeData.duration.endDate);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const challenge = new Challenge(challengeData);
    
    // Creator automatically joins the challenge
    challenge.participants.push({
      user: req.user._id,
      joinedAt: new Date(),
      progress: {
        currentValue: 0,
        lastUpdated: new Date()
      }
    });

    await challenge.save();
    await challenge.populate('creator', 'name email');

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Create challenge error:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating challenge'
    });
  }
};

// @desc    Get all public challenges
// @route   GET /api/challenges
// @access  Private
const getChallenges = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      challengeType, 
      difficulty, 
      category,
      search 
    } = req.query;
    
    // Build filter object
    const filter = { isPublic: true };
    
    if (status) filter.status = status;
    if (challengeType) filter.challengeType = challengeType;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const challenges = await Challenge.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');

    const total = await Challenge.countDocuments(filter);

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChallenges: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching challenges'
    });
  }
};

// @desc    Get single challenge
// @route   GET /api/challenges/:id
// @access  Private
const getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user can view this challenge
    if (!challenge.isPublic && challenge.creator._id.toString() !== req.user._id.toString()) {
      const isParticipant = challenge.participants.some(p => p.user._id.toString() === req.user._id.toString());
      if (!isParticipant) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this private challenge'
        });
      }
    }

    res.json({
      success: true,
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Get challenge error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching challenge'
    });
  }
};

// @desc    Join a challenge
// @route   POST /api/challenges/:id/join
// @access  Private
const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user can join
    const canJoin = challenge.canUserJoin(req.user._id);
    if (!canJoin.canJoin) {
      return res.status(400).json({
        success: false,
        message: canJoin.reason
      });
    }

    // Add user to participants
    await challenge.addParticipant(req.user._id);
    await challenge.populate('participants.user', 'name email');

    res.json({
      success: true,
      message: 'Successfully joined the challenge',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Join challenge error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error joining challenge'
    });
  }
};

// @desc    Leave a challenge
// @route   POST /api/challenges/:id/leave
// @access  Private
const leaveChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user is a participant
    const participantIndex = challenge.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not participating in this challenge'
      });
    }

    // Don't allow creator to leave their own challenge
    if (challenge.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Challenge creator cannot leave their own challenge'
      });
    }

    // Remove participant
    challenge.participants.splice(participantIndex, 1);
    await challenge.save();

    res.json({
      success: true,
      message: 'Successfully left the challenge'
    });
  } catch (error) {
    console.error('Leave challenge error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error leaving challenge'
    });
  }
};

// @desc    Update challenge progress
// @route   PUT /api/challenges/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a non-negative number'
      });
    }

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Find participant
    const participant = challenge.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'You are not participating in this challenge'
      });
    }

    // Update progress
    participant.progress.currentValue = progress;
    participant.progress.lastUpdated = new Date();

    // Check if target is reached
    if (progress >= challenge.targetValue && !participant.isCompleted) {
      participant.isCompleted = true;
      participant.completedAt = new Date();
    }

    await challenge.save();
    await challenge.populate('participants.user', 'name email');

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        challenge,
        userProgress: participant.progress,
        isCompleted: participant.isCompleted
      }
    });
  } catch (error) {
    console.error('Update progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating progress'
    });
  }
};

// @desc    Get user's challenges
// @route   GET /api/challenges/my-challenges
// @access  Private
const getUserChallenges = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build filter for challenges where user is participant or creator
    const filter = {
      $or: [
        { creator: req.user._id },
        { 'participants.user': req.user._id }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const challenges = await Challenge.find(filter)
      .sort({ createdAt: -1 })
      .populate('creator', 'name email')
      .populate('participants.user', 'name email');

    // Add user's progress to each challenge
    const challengesWithProgress = challenges.map(challenge => {
      const challengeObj = challenge.toObject();
      const userParticipant = challenge.participants.find(
        p => p.user._id.toString() === req.user._id.toString()
      );
      
      challengeObj.userProgress = userParticipant ? userParticipant.progress : null;
      challengeObj.userCompleted = userParticipant ? userParticipant.isCompleted : false;
      challengeObj.isCreator = challenge.creator._id.toString() === req.user._id.toString();
      
      return challengeObj;
    });

    res.json({
      success: true,
      data: {
        challenges: challengesWithProgress
      }
    });
  } catch (error) {
    console.error('Get user challenges error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user challenges'
    });
  }
};

// @desc    Get challenge leaderboard
// @route   GET /api/challenges/:id/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.user', 'name email');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Sort participants by progress (descending)
    const leaderboard = challenge.participants
      .map(participant => ({
        user: participant.user,
        progress: participant.progress.currentValue,
        isCompleted: participant.isCompleted,
        completedAt: participant.completedAt,
        progressPercentage: Math.round((participant.progress.currentValue / challenge.targetValue) * 100)
      }))
      .sort((a, b) => {
        // Completed participants first, then by progress
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.progress - a.progress;
      })
      .map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));

    res.json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          targetValue: challenge.targetValue,
          unit: challenge.unit
        },
        leaderboard
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    });
  }
};

export {
  createChallenge,
  getChallenges,
  getChallenge,
  joinChallenge,
  leaveChallenge,
  updateProgress,
  getUserChallenges,
  getLeaderboard
};