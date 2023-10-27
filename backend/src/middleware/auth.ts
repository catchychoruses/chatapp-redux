import { NextFunction, Response, Request } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

export interface RequestWithToken extends Request {
  token?: string;
}

function verifyToken(req: RequestWithToken, res: Response, next: NextFunction) {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY as Secret);
    req.token = decoded as string;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
}

export default verifyToken;
