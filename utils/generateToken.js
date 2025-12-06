const generateToken = (res, userId) => {
  const token = userId.toString(); 
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    domain: isProduction ? undefined : 'localhost' 
  });
  
  return token;
};

module.exports = generateToken;