import express from 'express';
import { body } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.js';
import Post from '../models/Post.js';

const router = express.Router();

// Get all posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name')
      .populate('verifiedBy', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: 'desc' });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post
router.post(
  '/posts',
  [
    auth,
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const post = new Post({
        author: req.user._id,
        content: req.body.content,
        media: req.body.media || [],
        tags: req.body.tags || [],
      });

      await post.save();
      await post
        .populate('author', 'name')
        .populate('verifiedBy', 'name')
        .populate('comments.author', 'name');

      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Error creating post' });
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
    res.json(post);
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
      await post
        .populate('author', 'name')
        .populate('verifiedBy', 'name')
        .populate('comments.author', 'name');

      res.json(post);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  }
);

// Verify post (moderator only)
router.patch(
  '/posts/:id/verify',
  [auth, authorize('moderator')],
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      post.isVerified = true;
      post.verifiedBy = req.user._id;

      await post.save();
      await post
        .populate('author', 'name')
        .populate('verifiedBy', 'name')
        .populate('comments.author', 'name');

      res.json(post);
    } catch (error) {
      console.error('Verify post error:', error);
      res.status(500).json({ message: 'Error verifying post' });
    }
  }
);

export default router;
