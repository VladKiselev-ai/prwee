import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  preferences: {
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
    notificationSettings: {
      email: { type: Boolean, default: true },
      telegram: { type: Boolean, default: false },
      telegramChatId: String,
      digestFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'never'],
        default: 'daily',
      },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  monitoredArticles: [{
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSchema.index({ email: 1 });
userSchema.index({ 'preferences.categories': 1 });

export default mongoose.models.User || mongoose.model('User', userSchema); 