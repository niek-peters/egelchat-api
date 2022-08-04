import Joi from "joi";
import jwt from "jsonwebtoken";

export type User = {
  uuid: string;
  name: string;
  email: string;
  pf_pic?: string;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type UserDB = {
  uuid: Buffer;
  name: string;
  email: string;
  password: string;
  pf_pic?: string;
};

// Validate incoming api calls
export function validate(user: User) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(255),
    email: Joi.string().email().required().min(3).max(255),
    password: Joi.string().required().min(3).max(255),
    pf_pic: Joi.string().uri().allow("").min(3).max(255),
  });

  return schema.validate(user);
}

// Generate JSON Web Token
export function generateAuthToken(user: User): string {
  return jwt.sign(user, process.env.JWT_PRIVATE_KEY as string);
}
