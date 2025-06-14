import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
  },
  isGroup: { type: Boolean, default: false },
  groupName: { type: String }, // optional
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for group
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation