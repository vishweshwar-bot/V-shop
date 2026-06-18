import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token signed with the user ID.
 * Expiry is configured for 30 days.
 * @param {string} id - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;
