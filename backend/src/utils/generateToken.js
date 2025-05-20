import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user.id);

  // Set cookie options
  const options = {
    expires: new Date(
      Date.now() + 24 * 60 * 60 * 1000 // 1 day
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // Remove password from response
  const userResponse = { ...user };
  delete userResponse.password;

  return res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse,
    });
};