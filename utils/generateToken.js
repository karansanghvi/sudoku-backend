const generateToken = (res, userId) => {
  const token = userId.toString(); 
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none', 
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  
  return token;
};

module.exports = generateToken;