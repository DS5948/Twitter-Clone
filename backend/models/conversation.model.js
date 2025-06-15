import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  lastMessage: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Message',
},
  isGroup: { type: Boolean, default: false },
  groupName: { type: String }, // optional
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional for group
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation