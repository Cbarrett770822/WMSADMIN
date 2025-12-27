const mongoose = require('mongoose');

const User = require('../../../../wms-shared-auth/src/models/User');
const { generateToken } = require('../../../../wms-shared-auth/src/utils/jwt');
const { connectToDatabase } = require('../../../../wms-shared-auth/src/utils/db');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    await connectToDatabase();

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password are required' })
      };
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid email or password' })
      };
    }

    if (!user.isActive) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Account is inactive' })
      };
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid email or password' })
      };
    }

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Access denied. Admin privileges required.' })
      };
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
