import express from 'express';
import { body, param, query } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.js';
import Incident from '../models/Incident.js';

const router = express.Router();

// Get incidents with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      type,
      status,
      priority,
      lat,
      lng,
      radius = 10000, // Default 10km radius
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Add filters if provided
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Add geospatial query if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      };
    }

    // Add role-based filters
    if (req.user.role === 'user') {
      query.$or = [
        { reportedBy: req.user._id },
        { status: 'active' },
        { assignedTo: req.user._id },
      ];
    } else if (req.user.role === 'responder') {
      query.$or = [
        { assignedTo: req.user._id },
        { status: 'pending' },
        { status: 'active' },
      ];
    }

    const skip = (page - 1) * limit;

    const incidents = await Incident.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Incident.countDocuments(query);

    res.json({
      incidents,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Error fetching incidents' });
  }
});

// Get single incident
router.get(
  '/:id',
  [auth, param('id').isMongoId().withMessage('Invalid incident ID')],
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id)
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('updates.updatedBy', 'name email');

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      res.json(incident);
    } catch (error) {
      console.error('Get incident error:', error);
      res.status(500).json({ message: 'Error fetching incident' });
    }
  }
);

// Create new incident
router.post(
  '/',
  [
    auth,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type')
      .isIn(['emergency', 'medical', 'fire', 'security', 'other'])
      .withMessage('Invalid incident type'),
    body('location.coordinates')
      .isArray()
      .withMessage('Location coordinates are required'),
    body('location.coordinates.*').isFloat().withMessage('Invalid coordinates'),
  ],
  async (req, res) => {
    try {
      const incident = new Incident({
        ...req.body,
        reportedBy: req.user._id,
        location: {
          type: 'Point',
          coordinates: req.body.location.coordinates,
        },
      });

      await incident.save();

      // Populate reporter details
      await incident.populate('reportedBy', 'name email');

      res.status(201).json(incident);
    } catch (error) {
      console.error('Create incident error:', error);
      res.status(500).json({ message: 'Error creating incident' });
    }
  }
);

// Update incident
router.patch(
  '/:id',
  [
    auth,
    param('id').isMongoId().withMessage('Invalid incident ID'),
    body('status')
      .optional()
      .isIn(['pending', 'active', 'resolved', 'closed'])
      .withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Check permissions
      if (
        req.user.role !== 'moderator' &&
        !incident.assignedTo.includes(req.user._id) &&
        incident.reportedBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: 'You do not have permission to update this incident',
        });
      }

      // Add update to history
      if (req.body.status && req.body.status !== incident.status) {
        incident.updates.push({
          message: `Status changed from ${incident.status} to ${req.body.status}`,
          status: req.body.status,
          updatedBy: req.user._id,
        });
      }

      // Set resolved date if status is being set to resolved
      if (req.body.status === 'resolved' && incident.status !== 'resolved') {
        incident.resolvedAt = new Date();
      }

      // Update fields
      Object.keys(req.body).forEach((key) => {
        if (key !== 'reportedBy' && key !== 'updates') {
          incident[key] = req.body[key];
        }
      });

      await incident.save();

      // Populate details
      await incident
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('updates.updatedBy', 'name email');

      res.json(incident);
    } catch (error) {
      console.error('Update incident error:', error);
      res.status(500).json({ message: 'Error updating incident' });
    }
  }
);

// Assign responders to incident
router.post(
  '/:id/assign',
  [
    auth,
    authorize('moderator'),
    param('id').isMongoId().withMessage('Invalid incident ID'),
    body('responders')
      .isArray()
      .withMessage('Responders must be an array of IDs'),
  ],
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      incident.assignedTo = req.body.responders;
      incident.status = 'active';
      incident.updates.push({
        message: 'Responders assigned to incident',
        status: 'active',
        updatedBy: req.user._id,
      });

      await incident.save();

      await incident
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('updates.updatedBy', 'name email');

      res.json(incident);
    } catch (error) {
      console.error('Assign responders error:', error);
      res.status(500).json({ message: 'Error assigning responders' });
    }
  }
);

// Add media to incident
router.post(
  '/:id/media',
  [
    auth,
    param('id').isMongoId().withMessage('Invalid incident ID'),
    body('type')
      .isIn(['image', 'video'])
      .withMessage('Invalid media type'),
    body('url').isURL().withMessage('Invalid media URL'),
  ],
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      incident.media.push({
        type: req.body.type,
        url: req.body.url,
        caption: req.body.caption,
      });

      await incident.save();
      res.json(incident);
    } catch (error) {
      console.error('Add media error:', error);
      res.status(500).json({ message: 'Error adding media' });
    }
  }
);

// Search incidents
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    const incidents = await Incident.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(incidents);
  } catch (error) {
    console.error('Search incidents error:', error);
    res.status(500).json({ message: 'Error searching incidents' });
  }
});

export default router;
