const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

exports.signup = async (req, res) => {
  try {
    const {
      fullName, email, password, phone, role,
      businessName, serviceDescription, profileImage,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    let avatar = '';
    if (profileImage) {
      const upload = await cloudinary.uploader.upload(profileImage, {
        folder: 'rolamax/users',
      });
      avatar = upload.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role,
      avatar,
      businessName,
      serviceDescription,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('[Signup Error]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is set in req.user by auth middleware
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
    }
    catch (err) {
    console.error('[Get User Profile Error]', err);
    res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is set in req.user by auth middleware
        const { fullName, phone, businessName, serviceDescription, profileImage } = req.body;
    
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        if (profileImage) {
        const upload = await cloudinary.uploader.upload(profileImage, {
            folder: 'rolamax/users',
        });
        user.avatar = upload.secure_url;
        }
    
        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;
        user.businessName = businessName || user.businessName;
        user.serviceDescription = serviceDescription || user.serviceDescription;
    
        await user.save();
    
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error('[Update User Profile Error]', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is set in req.user by auth middleware
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        // Optionally, delete the user's avatar from Cloudinary
        if (user.avatar) {
        const publicId = user.avatar.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(`rolamax/users/${publicId}`);
        }
    
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('[Delete User Error]', err);
        res.status(500).json({ message: 'Server error' });
    }
};
