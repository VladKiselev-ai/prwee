import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    name: String,
    url: String,
    logo: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  tags: [{
    type: String,
  }],
  publishedAt: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    default: '',
  },
  readingTime: {
    type: Number,
    default: 0,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
  importance: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  isMonitored: {
    type: Boolean,
    default: false,
  },
  monitoredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ isMonitored: 1, monitoredBy: 1 });

export default mongoose.models.Article || mongoose.model('Article', articleSchema); 