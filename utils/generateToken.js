const generateToken = (res, userId) => {
  const token = userId.toString(); 
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax', 
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  
  return token;
};

module.exports = generateToken;