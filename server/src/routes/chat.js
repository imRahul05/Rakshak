import express from 'express';
import { auth } from '../middlewares/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get chat messages for an incident
router.get('/:incidentId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ incidentId: req.params.incidentId })
      .populate('sender', 'name')
      .sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a new message
router.post('/:incidentId', auth, async (req, res) => {
  try {
    const message = new Message({
      incidentId: req.params.incidentId,
      sender: req.user._id,
      content: req.body.content,
      messageType: req.body.messageType || 'text',
    });

    await message.save();
    await message.populate('sender', 'name');

    // Emit through Socket.IO (will be handled in the main server file)
    req.app.get('io').to(req.params.incidentId).emit('message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark messages as read
router.post('/:incidentId/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        incidentId: req.params.incidentId,
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

export default router;
