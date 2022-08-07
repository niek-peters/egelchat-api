import imageType from "image-type";
import { minimumBytes } from "image-type";

export type Image = {
  pf_pic: File;
};

export async function validateImage(pf_pic: File) {
  console.log(pf_pic);
}
