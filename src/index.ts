import express from 'express';
import speakeasy from 'speakeasy';
import short from 'short-uuid';
import QRCode from 'qrcode';

import config from './config/keys';
import { db } from './db';
import { OTP_ISSUER } from './constants';
import { User } from './types';

const PORT = config.port;

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get('/', (req, res) => {
  return res.json({ message: 'Node OTP!' });
});

app.post('/api/otp-generate', async (req, res) => {
  try {
    const user_id = short.generate();
    const otp_secret = speakeasy.generateSecret({
      issuer: OTP_ISSUER,
      name: `Hub(${user_id})`,
    });

    const user: User = {
      _id: user_id,
      otp_secret,
    };

    await db.insert(user);

    const qr = await QRCode.toDataURL(otp_secret.otpauth_url);

    res.json({ user_id, secret: otp_secret.base32, qr });
  } catch (error) {
    res.status(500).json({ message: 'Error generating the secret' });
  }
});

app.post('/api/otp-verify', async (req, res) => {
  try {
    const { token, userId } = req.body;
    const user = (await db.get(userId)) as User;

    const { base32: secret } = user.otp_secret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      const userToBeUpdated: User = {
        _id: userId,
        otp_secret: user.otp_secret,
        otp_enabled: true,
        _rev: user._rev,
      };

      await db.insert(userToBeUpdated);
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user!' });
  }
});

app.post('/api/otp-validate', async (req, res) => {
  try {
    const { token, userId } = req.body;
    const user = (await db.get(userId)) as User;

    const { base32: secret } = user.otp_secret;
    const tokenValidate = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (tokenValidate) {
      res.json({ validated: true });
    } else {
      res.json({ validated: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user!' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
