import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: [true, 'Please enter school name.'],
    validate: {
      validator: function (val) {
        return /^[a-zA-Z.',\s\-]+$/.test(val);
      },
      message: "Please name must contain letters, spaces and (.,'-) only."
    }
  },
  email: {
    type: String,
    required: [true, 'Please enter email address.'],
    validate: [validator.isEmail, 'Please provide a valid email.'],
    unique: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please enter contact number.'],
    validate: {
      validator: function (val) {
        return /^[0-9]{11}$/.test(val);
      },
      message: 'Please contact number must be an 11 digit long number.'
    }
  },
  contactAddress: {
    type: String,
    required: [true, 'Please enter contact address.'],
    validate: {
      validator: function (val) {
        return /^[a-zA-Z0-9\s,.'-]+$/.test(val);
      },
      message:
        "Please contact address must contain letters, numbers, spaces and (.,'-) only."
    }
  },
  adminName: {
    type: String,
    required: [true, 'Please Administrator, enter your name.'],
    validate: {
      validator: function (val) {
        return /^[a-zA-Z.'\s]+$/.test(val);
      },
      message: "Please name must contain letters, spaces and (.') only."
    }
  },
  licence: String,
  password: {
    type: String,
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same.'
    }
  },

  createdAt: {
    type: Date,
    Default: Date.now
  },
  active: {
    type: Boolean,
    Default: false
  }
});

schoolSchema.pre('save', async function (next) {
  if (!this.isModified) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

export default mongoose.model('School', schoolSchema);
