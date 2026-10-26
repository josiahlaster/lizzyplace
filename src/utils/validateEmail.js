// Strict check that matches what mail APIs accept — the browser's built-in
// "type=email" validation allows values like "name.@gmail.com" which APIs reject.
export default function validateEmail(value) {
  if (!value) return false;
  return /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(
    value.trim()
  );
}
