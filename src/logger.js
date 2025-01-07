import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        process.env.NODE_ENV === 'local' ? winston.format.prettyPrint() : winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
    ],
});
export default logger;
