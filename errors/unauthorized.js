const { StatusCodes } = require("http-status-codes");
const CustomErr = require("./custom-api");
class UnauthorizedError extends CustomErr {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
