const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const mongoose = require('mongoose');

// Test route to verify router is working
router.get('/users/test', (req, res) => {
  res.json({ message: 'Users router is working!' });
});

// GET /api/users - Get all users (for admin/testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName email country createdAt').sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id - Get single user by ID
router.get('/users/:id', async (req, res) => {
  let success = false;
  try {
    const userId = req.params.id;
    const user = await User.findById(userId, 'firstName lastName email country createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ success, message: 'User not found' });
    }
    
    success = true;
    res.json({ success, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success, message: 'Server error' });
  }
});

// PUT /api/users/:id - Update single user by ID
router.put('/users/:id', async (req, res) => {
  let success = false;
  console.log('PUT /api/users/:id - Update request received');
  console.log('User ID:', req.params.id);
  console.log('Request body:', req.body);
  
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log('User not found:', userId);
      return res.status(404).json({ success, message: 'User not found' });
    }
    
    console.log('Existing user found:', existingUser._id);
    
    // Get update data from request body
    const { firstName, lastName, email, country } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    if (firstName !== undefined && firstName !== '') updateData.firstName = firstName;
    if (lastName !== undefined && lastName !== '') updateData.lastName = lastName;
    if (email !== undefined && email !== '') {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ success, message: 'Email already in use by another user' });
      }
      updateData.email = email;
    }
    // Country can be empty string (optional field)
    if (country !== undefined) updateData.country = country;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: 'firstName lastName email country createdAt updatedAt' }
    );
    
    success = true;
    res.json({ success, message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success, message: 'Server error', error: err.message });
  }
});

// DELETE /api/users/:id - Delete single user by ID
router.delete('/users/:id', async (req, res) => {
  let success = false;
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success, message: 'User not found' });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    success = true;
    res.json({ success, message: 'User deleted successfully', deletedUser: user });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success, message: 'Server error' });
  }
});

// DELETE /api/users/bulk/:criteria - Delete multiple users by criteria
router.delete('/bulk/:criteria', async (req, res) => {
  let success = false;
  try {
    const criteria = req.params.criteria;
    
    // Build query based on criteria (e.g., country, or any other field)
    let query = {};
    
    // If criteria is a country name
    if (criteria) {
      query.country = criteria;
    }
    
    // Find users matching criteria
    const usersToDelete = await User.find(query);
    
    if (usersToDelete.length === 0) {
      return res.status(404).json({ success, message: 'No users found matching the criteria' });
    }
    
    console.log(`Deleting ${usersToDelete.length} users`);
    
    // Extract IDs
    const userIds = usersToDelete.map(user => user._id);
    
    // Delete all matching users
    await User.deleteMany({ _id: { $in: userIds } });
    
    success = true;
    res.json({ 
      success, 
      message: `Successfully deleted ${usersToDelete.length} users`,
      deletedCount: usersToDelete.length
    });
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ success, message: 'Server error' });
  }
});

// PUT /api/users/bulk/:criteria - Update multiple users by criteria
router.put('/bulk/:criteria', async (req, res) => {
  let success = false;
  try {
    const criteria = req.params.criteria;
    const { firstName, lastName, country } = req.body;
    
    // Build query based on criteria
    let query = {};
    if (criteria) {
      query.country = criteria;
    }
    
    // Find users matching criteria
    const usersToUpdate = await User.find(query);
    
    if (usersToUpdate.length === 0) {
      return res.status(404).json({ success, message: 'No users found matching the criteria' });
    }
    
    // Create update object with only provided fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (country) updateData.country = country;
    
    console.log(`Updating ${usersToUpdate.length} users`);
    
    // Extract IDs
    const userIds = usersToUpdate.map(user => user._id);
    
    // Update all matching users
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );
    
    success = true;
    res.json({ 
      success, 
      message: `Successfully updated ${usersToUpdate.length} users`,
      updatedCount: usersToUpdate.length
    });
  } catch (err) {
    console.error('Error updating users:', err);
    res.status(500).json({ success, message: 'Server error' });
  }
});

module.exports = router;