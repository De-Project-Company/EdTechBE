import crypto from 'crypto';
import otpGenerator from 'otp-generator';

const licenceNumberGenerator = () => {
  const licence = otpGenerator.generate(11, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false
  });
  const hashedLicence = crypto
    .createHash('sha256')
    .update(licence)
    .digest('hex');

  return { licence, hashedLicence };
};

export { licenceNumberGenerator };
