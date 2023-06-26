const jwt = require("jsonwebtoken");

const createJwt = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFTTIME,
  });

  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookieToResponse = ({ res, user }) => {
  const token = createJwt({ payload: user });
  const one = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + one),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = {
  attachCookieToResponse,
  createJwt,
  isTokenValid,
};
