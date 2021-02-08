// load requirements
const winston = require('winston')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

// log levels
let logLevels = {
  error:    0,
  warn:     1,
  info:     2,
  http:     3,
  verbose:  4,
  debug:    5,
  silly:    6
}

// adds colors to the logs
const colorizer = winston.format.colorize();

// creates logger
const logger = winston.createLogger({
    levels: logLevels,
    format: combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(msg =>
            colorizer.colorize(msg.level, `${msg.timestamp} - ${msg.level}: ${msg.message} - ${msg.endpoint}
              ::${msg.programMsg}`)
        )
      ),
    transports: [
        new (winston.transports.Console)({
            prettyPrint: true,
            colorize: true,
            timestamp: true,

        }),
    ],
});

module.exports = logger
