import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'post', 'reel'],
    default: 'text'
  },
  text: { type: String },
  mediaUrl: { type: String }, // ✅ keep this as-is (used for image/video URL)
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  caption: { type: String },

  // ✅ Add replyTo field to support message replies
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  isReadBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
