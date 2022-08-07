import Joi from "joi";

export type Chat = {
  uuid: string;
  owner_uuid: string;
  name: string;
};

export type ChatDB = {
  uuid: Buffer;
  owner_uuid: Buffer;
  name: string;
};

// Validate incoming api calls
export function validate(chat: Chat) {
  const schema = Joi.object({
    owner_uuid: Joi.string().required().length(36),
    name: Joi.string().required().min(3).max(24),
  });

  return schema.validate(chat);
}
