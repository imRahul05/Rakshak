import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video'],
      },
      url: String,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    tags: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
postSchema.index({
  content: 'text',
  tags: 'text',
});

const Post = mongoose.model('Post', postSchema);

export default Post;
