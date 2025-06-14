import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['text', 'image', 'video', 'post', 'reel'], 
    default: 'text' 
  },
  text: { type: String },
  mediaUrl: { type: String },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // when sharing a post/reel
  caption: { type: String },
  isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message