const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { apodo, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ apodo });
    if (userExists) {
      return res.status(400).json({ message: 'El apodo ya está en uso' });
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      apodo,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};