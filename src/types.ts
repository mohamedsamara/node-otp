import { MaybeDocument } from 'nano';
import { GeneratedSecret } from 'speakeasy';

export interface User extends MaybeDocument {
  //   _id: string;
  otp_secret: GeneratedSecret;
  otp_enabled?: boolean;
}
