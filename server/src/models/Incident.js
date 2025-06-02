import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['emergency', 'medical', 'fire', 'security', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'resolved', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    media: [{
      type: {
        type: String,
        enum: ['image', 'video'],
      },
      url: String,
      caption: String,
    }],
    updates: [{
      message: String,
      status: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    resolvedAt: Date,
    address: {
      formatted: String,
      city: String,
      state: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create a geospatial index on the location field
incidentSchema.index({ location: '2dsphere' });

// Create a text index for search
incidentSchema.index({
  title: 'text',
  description: 'text',
  'address.formatted': 'text',
});

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
