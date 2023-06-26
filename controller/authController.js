const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookieToResponse, createTokenUser } = require("../utils");
const register = async function (req, res) {
  const { name, password, email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }
  let isFirstUser = (await User.countDocuments({})) === 0;
  const role = isFirstUser ? "admin" : "user";
  const user = await User.create({ name, password, email, role });
  const tokenUser = createTokenUser(user);

  attachCookieToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
const login = async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("email / password is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("User not found");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("password is not correct");
  }

  const tokenUser = createTokenUser(user);
  attachCookieToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });

  // res.send("login user");
};
const logout = function (req, res) {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).send({ msg: "user logged out" });
};

module.exports = {
  register,
  login,
  logout,
};
