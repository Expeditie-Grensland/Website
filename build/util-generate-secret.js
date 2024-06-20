import sodium from "sodium-native";

const key = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);

if (process.argv[2]) {
  const salt = Buffer.from("mq9hDxBVDbspDR6nLfFT1g==", "base64");

  sodium.crypto_pwhash(
    key,
    Buffer.from(process.argv[2]),
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );
} else {
  sodium.randombytes_buf(key);
}

console.log(key.toString("base64"));
