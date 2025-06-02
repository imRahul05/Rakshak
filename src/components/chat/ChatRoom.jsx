import { useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { selectAllIncidents } from '../../features/incidents/incidentsSlice';
import io from 'socket.io-client';
import config from '../../config';

const ChatRoom = ({ incidentId: propIncidentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState(propIncidentId);
  const user = useSelector(selectCurrentUser);
  const incidents = useSelector(selectAllIncidents);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedIncidentId) return;

    // Connect to socket
    socketRef.current = io(config.api.socketURL);

    // Join incident room
    socketRef.current.emit('join-incident', selectedIncidentId);

    // Listen for messages
    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Load previous messages
    loadMessages();

    return () => {
      socketRef.current.emit('leave-incident', selectedIncidentId);
      socketRef.current.disconnect();
    };
  }, [selectedIncidentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`${config.api.baseURL}/chat/${selectedIncidentId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIncidentId) return;

    const messageData = {
      incidentId: selectedIncidentId,
      content: newMessage,
      sender: user._id,
      senderName: user.name,
      timestamp: new Date(),
    };

    socketRef.current.emit('send-message', messageData);
    setNewMessage('');
  };

  if (!selectedIncidentId) {
    return (
      <div className="flex flex-col h-full p-4">
        <h2 className="text-2xl font-bold mb-4">Select an Incident to Chat</h2>
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <button
              key={incident._id}
              onClick={() => setSelectedIncidentId(incident._id)}
              className="p-4 border rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-semibold">{incident.title}</h3>
              <p className="text-sm text-gray-600 truncate">{incident.description}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs text-white bg-${incident.priority === 'high' ? 'red' : incident.priority === 'medium' ? 'yellow' : 'green'}-500`}>
                  {incident.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === user._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.sender === user._id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm font-semibold">
                  {message.sender === user._id ? 'You' : message.senderName}
                </div>
                <div className="mt-1">{message.content}</div>
                <div className="mt-1 text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
