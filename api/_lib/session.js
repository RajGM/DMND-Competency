const SESSION_COOKIE = "dmnd_mock_sid";

function parseCookieHeader(cookieHeader) {
  const map = {};
  if (!cookieHeader) return map;
  cookieHeader.split(";").forEach((chunk) => {
    const [key, ...rest] = chunk.trim().split("=");
    if (!key) return;
    map[key] = decodeURIComponent(rest.join("="));
  });
  return map;
}

function encodeSession(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSession(value) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function setSession(res, payload) {
  const value = encodeSession(payload);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
  );
}

function clearSession(res) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function getSession(req) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const value = cookies[SESSION_COOKIE];
  if (!value) return null;
  return decodeSession(value);
}

module.exports = {
  setSession,
  clearSession,
  getSession,
};
