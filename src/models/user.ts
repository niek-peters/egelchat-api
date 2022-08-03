import Joi from "joi";

export type User = {
  name: string;
  email: string;
  pf_pic?: string;
};

export type UserFull = {
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
