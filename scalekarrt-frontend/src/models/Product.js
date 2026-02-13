const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative'],
      max: [999999, 'Price cannot exceed 999,999'],
    },
    category: {
      type: String,
      required: [true, 'Please select product category'],
      enum: [
        'Electronics',
        'Fashion',
        'Home & Kitchen',
        'Books',
        'Sports',
        'Beauty',
        'Toys',
        'Automotive',
        'Health',
        'Grocery',
      ],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must have a seller'],
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          maxlength: [500, 'Review cannot exceed 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isApproved: {
      type: Boolean,
      default: false, // Admin must approve new products
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ ratings: -1 });

// Calculate average rating before saving
productSchema.pre('save', function () {
  if (this.reviews && this.reviews.length > 0) {
    this.numOfReviews = this.reviews.length;

    this.ratings =
      this.reviews.reduce((acc, item) => acc + item.rating, 0) /
      this.reviews.length;
  } else {
    this.numOfReviews = 0;
    this.ratings = 0;
  }
});



module.exports = mongoose.model('Product', productSchema);