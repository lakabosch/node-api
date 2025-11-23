const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    required: true,
    enum: ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial']
  },
  status: {
    type: String,
    enum: ['for-sale', 'for-rent', 'sold', 'rented'],
    default: 'for-sale'
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  area: {
    type: Number,
    min: 0
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  amenities: [String],
  images: [String],
  yearBuilt: Number,
  parking: {
    type: Number,
    min: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create location field for geospatial queries
propertySchema.index({ location: '2dsphere' });

// Static method to get properties within radius
propertySchema.statics.getPropertiesInRadius = async function(zipcode, distance) {
  // This would typically integrate with a geocoding service
  // For demo purposes, we'll return all properties
  return this.find();
};

module.exports = mongoose.model('Property', propertySchema);