import express from 'express';
import { body } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.js';
import upload from '../middlewares/uploadMedia.js';
import Post from '../models/Post.js';

const router = express.Router();

// Get all posts with filtering
router.get('/posts', auth, async (req, res) => {
  try {
    const { filter } = req.query;
    let query = {};
    
    if (filter === 'verified') {
      query.isVerified = true;
    } else if (filter === 'trending') {
      // Get posts from last 7 days and sort by engagement
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    const posts = await Post.find(query)
      .populate('author', 'name')
      .populate('verifiedBy', 'name')
      .populate('comments.author', 'name')
      .sort(
        filter === 'trending'
          ? { likes: -1, 'comments.length': -1, createdAt: -1 }
          : { createdAt: -1 }
      );

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post with media upload
router.post(
  '/posts',
  [
    auth,
    upload.single('media'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      // Parse tags if they exist
      let tags = [];
      if (req.body.tags) {
        try {
          tags = JSON.parse(req.body.tags);
        } catch (e) {
          console.warn('Error parsing tags:', e);
        }
      }

      const post = new Post({
        author: req.user._id,
        content: req.body.content,
        tags: tags
      });

      if (req.file) {
        post.media = [{
          type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
          url: `/uploads/${req.file.filename}`
        }];
      }

      // Save the post first
      const savedPost = await post.save();
      
      // Then populate the required fields
      const populatedPost = await Post.findById(savedPost._id)
        .populate('author', 'name')
        .populate('verifiedBy', 'name')
        .populate('comments.author', 'name');

      res.status(201).json(populatedPost);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Error creating post: ' + error.message });
    }
  }
);

// Like/unlike a post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('verifiedBy', 'name')
      .populate('comments.author', 'name');

    res.json(populatedPost);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Add a comment
router.post(
  '/posts/:id/comments',
  [
    auth,
    body('content').trim().notEmpty().withMessage('Comment content is required'),
  ],
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.comments.push({
        author: req.user._id,
        content: req.body.content,
      });

      await post.save();
      
      const populatedPost = await Post.findById(post._id)
        .populate('author', 'name')
        .populate('verifiedBy', 'name')
        .populate('comments.author', 'name');

      res.json(populatedPost);
    } catch (error) {
      console.error('Comment error:', error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  }
);

// Verify a post (admin only)
router.patch('/posts/:id/verify', [auth, authorize('admin')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isVerified = true;
    post.verifiedBy = req.user._id;
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('verifiedBy', 'name')
      .populate('comments.author', 'name');

    res.json(populatedPost);
  } catch (error) {
    console.error('Verify post error:', error);
    res.status(500).json({ message: 'Error verifying post' });
  }
});

export default router;
