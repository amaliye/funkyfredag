import { Hono } from "hono";
import { serve } from "@hono/node-server";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const postgresql = connectionString
  ? new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } })
  : new pg.Pool({ user: "postgres", password: "postgres" });

const schema = "kulturminner_7a5c3d44675b4cefa41950d09bbe7f50";

const app = new Hono();

// ✅ CORS middleware
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "http://localhost:5173");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 200);
  }

  return await next();
});

// ✅ API endpoint
app.get("/api/culturalheritage", async (c) => {
  const result = await postgresql.query(`
      SELECT navn, opphav, informasjon, 
             ST_AsGeoJSON(ST_Transform(lokalitet.omrade, 4326)) AS geometry
      FROM ${schema}.lokalitet
      WHERE synlig = true
      LIMIT 9000
    `);

  return c.json({
    type: "FeatureCollection",
    crs: {
      type: "name",
    },
    features: result.rows.map(({ geometry, ...props }) => ({
      type: "Feature",
      properties: props,
      geometry: JSON.parse(geometry),
    })),
  });
});

serve(app);
