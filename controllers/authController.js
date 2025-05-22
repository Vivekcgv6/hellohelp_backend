  const bcrypt = require('bcryptjs');
  const jwt = require('jsonwebtoken');
  const { createUser, findUserByEmail, findUserById } = require('../models/userModel');
  const { parsePhoneNumberFromString } = require('libphonenumber-js');

  // Registration function

  const SUPPORTED_REGIONS = ['US', 'CA', 'IN']; // Add more regions as needed

  exports.register = async (req, res) => {
    const { username, email, phone, password } = req.body;

    try {
      // Basic field validation
      if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      // Phone validation (support US, Canada, India)
      let validPhone = false;
      for (const region of SUPPORTED_REGIONS) {
        const parsed = parsePhoneNumberFromString(phone, region);
        if (parsed && parsed.isValid()) {
          validPhone = true;
          break;
        }
      }
      if (!validPhone) {
        return res.status(400).json({ error: 'Invalid phone number. Only US, Canada, and India numbers are accepted.' });
      }

      // Email uniqueness check
      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Password hash and user creation
      const hashed = await bcrypt.hash(password, 10);
      const user = await createUser(username, email, phone, hashed);

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, email: user.email, phone: user.phone },
      });

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  //Login_function

  exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await findUserByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          userId: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          createUser: user.createUser,

        }, 
        process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful',
        token,
        user: { 
          id: user.id,
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  //user_info_function

  exports.getUserInfo = async (req, res) => {
    const userId = req.user.userId; // Extract userId from the token
    try {
      const user = await findUserById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        createUser: user.createUser,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
