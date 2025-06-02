import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { axiosPrivate } from '../services/api';
import { 
  ChatBubbleLeftRightIcon, 
  HandThumbUpIcon,
  PhotoIcon,
  TagIcon,
  ShieldCheckIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, trending
  const fileInputRef = useRef();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      const response = await axiosPrivate.get('/community/posts', {
        params: { filter }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setMediaPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const formData = new FormData();
    formData.append('content', newPost);
    if (tags) {
      // Convert tags to JSON string
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      formData.append('tags', JSON.stringify(tagArray));
    }
    if (media) {
      formData.append('media', media);
    }

    try {
      const response = await axiosPrivate.post('/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
      setTags('');
      clearMedia();
    } catch (error) {
      console.error('Error creating post:', error.response?.data?.message || error.message);
      // You might want to show this error to the user
    }
  };

  const handleLike = async (postId) => {
    try {
      await axiosPrivate.post(`/community/posts/${postId}/like`);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!comment.trim()) return;

    try {
      await axiosPrivate.post(`/community/posts/${postId}/comments`, {
        content: comment
      });
      setComment('');
      loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleVerify = async (postId) => {
    try {
      await axiosPrivate.patch(`/community/posts/${postId}/verify`);
      loadPosts();
    } catch (error) {
      console.error('Error verifying post:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Create Post Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags (comma separated)"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-blue-500"
            >
              <PhotoIcon className="h-6 w-6" />
            </button>
            
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Post
            </button>
          </div>

          {mediaPreview && (
            <div className="mt-4 relative">
              {media?.type?.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg" />
              ) : (
                <video src={mediaPreview} className="max-h-48 rounded-lg" controls />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Posts</option>
            <option value="verified">Verified Only</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{post.author?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {post.isVerified && (
                  <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                )}
              </div>

              <p className="mb-4">{post.content}</p>

              {post.media?.length > 0 && (
                <div className="mb-4">
                  {post.media.map((m, index) => (
                    <div key={index} className="mt-2">
                      {m.type === 'image' ? (
                        <img src={m.url} alt="" className="max-h-96 rounded-lg" />
                      ) : (
                        <video src={m.url} className="max-h-96 rounded-lg" controls />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-gray-600">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-1 hover:text-blue-500 ${
                    post.likes.includes(user?._id) ? 'text-blue-500' : ''
                  }`}
                >
                  <HandThumbUpIcon className="h-5 w-5" />
                  <span>{post.likes.length}</span>
                </button>

                <button
                  onClick={() => setSelectedPost(selectedPost === post._id ? null : post._id)}
                  className="flex items-center gap-1 hover:text-blue-500"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>{post.comments.length}</span>
                </button>

                {user?.role === 'admin' && !post.isVerified && (
                  <button
                    onClick={() => handleVerify(post._id)}
                    className="flex items-center gap-1 hover:text-green-500"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Verify</span>
                  </button>
                )}
              </div>

              {selectedPost === post._id && (
                <div className="mt-4 space-y-4">
                  <div className="pl-8 space-y-4">
                    {post.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author?.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pl-8 flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleComment(post._id)}
                      disabled={!comment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
