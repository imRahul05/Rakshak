import express from 'express';
import { auth, authorize } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get available responders
router.get('/available', [auth, authorize('moderator')], async (req, res) => {
  try {
    const responders = await User.find({
      role: 'responder',
      status: 'active',
    }).select('name email status location');

    res.json({ responders });
  } catch (error) {
    console.error('Error fetching responders:', error);
    res.status(500).json({ message: 'Error fetching available responders' });
  }
});

// Update responder location
router.post('/location', [auth, authorize('responder')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.location = req.body.location;
    await user.save();

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
});

// Update responder status
router.patch('/status', [auth, authorize('responder')], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = req.body.status;
    await user.save();

    res.json({ message: 'Status updated successfully', status: user.status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

export default router;
