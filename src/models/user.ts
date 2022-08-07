import Joi from "joi";
import jwt from "jsonwebtoken";

export type User = {
  uuid: string;
  name: string;
  email: string;
  pf_pic?: string;
};

export type UserPut = {
  uuid: string;
  name: string;
  password: string;
  newPassword: string;
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
    name: Joi.string().required().min(3).max(24),
    email: Joi.string().email().required().min(3).max(255),
    password: Joi.string().required().min(3).max(63),
    pf_pic: Joi.string().uri().allow("").min(3).max(63),
  });

  return schema.validate(user);
}

export function validatePut(user: UserPut) {
  const schema = Joi.object({
    uuid: Joi.string().required().length(36),
    name: Joi.string().min(3).max(24),
    password: Joi.string().min(3).max(63),
    new_password: Joi.string().min(3).max(63),
    pf_pic: Joi.string().uri().allow("").min(3).max(63),
  });

  return schema.validate(user);
}

// Generate JSON Web Token
export function generateAuthToken(user: User): string {
  return jwt.sign(user, process.env.JWT_PRIVATE_KEY as string);
}

// Validate JSON Web Token
export function validateAuthToken(token: string): boolean {
  try {
    if (!token.includes("Bearer ")) return false;
    jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_PRIVATE_KEY as string
    );
    return true;
  } catch (_e) {
    return false;
  }
}
