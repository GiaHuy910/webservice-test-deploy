// const fs = require("fs");
// const https = require("https");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { base64url } = require("./helpers");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3001;

//KHONG DUOC DE LO SECRET KEY
const jwtSecret =
  "dbctYiyub388ZQtcoBilW9ezSZwtncEZsqpU7SRp4N8TDdzVCkIDXBQhbjQbUBItcu3ktOrQuh/dzPEYVHDnEnSRAa2YVTwugfBrSH4A+ZyL2ojO89Y0h19QAXMcUPXxT05PZc86KMiaFG2FkYFouxCwO7Mb/cxGy7YS5duCx+3mI2bLzBf5ZMaGvFY9U50/wtJzTRHt/Il1EUAfK5+cmsB2Pnp2VhgVmTqOT58x3tWEFctQyWAUWKb/KXXoR5n7JMiVRbNi8LPBjIDdfQKHu1163Z39SDc9LZdWHwNmzbZJkcvRD7VjJ54x+JZ3SlLxklphHsvp5PI5GW+SCMY9Kg==";

app.use(
  cors({
    origin: "https://webservice-test-deploy-1.onrender.com",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // de xu li thong tin tu form

//fake db
const db = {
  users: [
    {
      id: 1,
      email: "HuyRose@gmail.com",
      password: "123456",
      name: "Bui Gia Huy",
    },
  ],
  posts: [
    { id: 1, title: "Title 1", description: "description 1" },
    { id: 2, title: "Title 2", description: "description 2" },
    { id: 3, title: "Title 3", description: "description 3" },
  ],
};

//const sessions={};

//[GET] /api/posts
app.get("/api/posts", (req, res) => {
  res.json(db.posts);
});
//[POST] /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password,
  );
  if (!user) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
  // const sessionId = Date.now().toString();
  // sessions[sessionId] = { sub: user.id };
  // res
  //   .setHeader(
  //     "Set-Cookie",
  //     // `sessionId=${sessionId}; HttpOnly;max-age=3600;SameSite=None;Secure;Partitioned;`,
  //     `sessionId=${sessionId}; HttpOnly;max-age=3600;`,
  //   )
  //   .json(user);

  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload = {
    sub: user.id,
    exp: Date.now() + 3600000,
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");

  res.json({ token: `${tokenData}.${signature}` });
});
//[GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
  token = req.headers.authorization?.slice(7);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
  const [encodedHeader, encodedPayload, tokenSignature] = token.split(".");
  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");
  if (signature !== tokenSignature) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const payload = JSON.parse(atob(encodedPayload));
  const user = db.users.find((user) => user.id === payload.sub);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (payload.exp < Date.now()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(user);
});

// https
//   .createServer(
//     {
//       key: fs.readFileSync("testcookie.com+2-key.pem"),
//       cert: fs.readFileSync("testcookie.com+2.pem"),
//     },
//     app,
//   )
//   .listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//   });
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at port ${PORT}`);
});
