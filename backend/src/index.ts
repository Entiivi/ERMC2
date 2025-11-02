// src/index.ts
import app from "./server";

const PORT = Number(process.env.PORT ?? 4000);
const base = process.env.PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;

console.log("Listening on", base);

app.listen(PORT, () => {
  console.log(`✅ Backend running at ${base}`);
});
