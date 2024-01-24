import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String
  },
  email: {
    type: String,
    unique: true
  },
  phoneNumber: {
    type: String
  },
  contactAddress: {
    type: String
  },
  adminName: {
    type: String
  },
  licence: {
    type: String,
    select: false
  },
  password: {
    type: String,
    select: false
  },
  passwordConfirm: {
    type: String
  },
  role: {
    type: String,
    default: "school"
  },
  createdAt: {
    type: Date,
    Default: Date.now
  },
  active: {
    type: Boolean,
    Default: false,
    select: false
  }
});

schoolSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

schoolSchema.methods.correctPassword = async function (
  candidatePassword,
  ownerPassword
) {
  return await bcrypt.compare(candidatePassword, ownerPassword);
};

export default mongoose.model('School', schoolSchema);
