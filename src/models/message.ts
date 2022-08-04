import JoiBase from "joi";
import JoiDate from "@joi/date";
const Joi = JoiBase.extend(JoiDate);

export type Message = {
  id: number;
  chat_uuid: string;
  sender_uuid: string;
  content: string;
  // YYYY-MM-DD hh:mm:ss
  sent_at: string;
};

export type MessageDB = {
  chat_uuid: Buffer;
  sender_uuid: Buffer;
  content: string;
  // YYYY-MM-DD hh:mm:ss
  sent_at: string;
};

export type MessageDBRes = {
  id: number;
  chat_uuid: Buffer;
  sender_uuid: Buffer;
  content: string;
  // YYYY-MM-DD hh:mm:ss
  sent_at: string;
};

// Validate incoming api calls
export function validate(message: Message) {
  const schema = Joi.object({
    chat_uuid: Joi.string().required().min(3).max(255),
    sender_uuid: Joi.string().required().min(3).max(255),
    content: Joi.string().required().min(3).max(65535),
    // YYYY-MM-DD hh:mm:ss
    sent_at: Joi.date().format("YYYY-MM-DD HH:mm:ss").required(),
  });

  return schema.validate(message);
}
