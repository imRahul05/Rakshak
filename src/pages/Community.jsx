import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { axiosPrivate } from '../services/api';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await axiosPrivate.get('/community/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axiosPrivate.post('/community/posts', {
        content: newPost,
      });
      setPosts([response.data, ...posts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Community Forum</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with your community..."
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="3"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Post
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div>Loading...</div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow p-6 space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                    {post.author.name[0]}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">{post.author.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{post.content}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{post.likes.length}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-primary-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{post.comments.length}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
