import { Request, Response, NextFunction } from "express";

export default function sameUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!res.locals.user)
    return res
      .status(502)
      .send("This API endpoint is broken, contact the server admin.");
  const user = res.locals.user;

  if (req.body.uuid === user.uuid) next();
  else if (req.body.sender_uuid === user.uuid) next();
  else if (req.body.owner_uuid === user.uuid) next();
  else if (!(req.body.uuid || req.body.sender_uuid || req.body.owner_uuid))
    next();
  else
    return res
      .status(403)
      .send("You don't have permission to access this resource.");
}
