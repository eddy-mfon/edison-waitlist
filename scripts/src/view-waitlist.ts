import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://edison:bV5N63L926us4NMqdrraGDh42YKCuYek@dpg-dao2e3142hec7386kqhg-a.oregon-postgres.render.com/edisonwlist";

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    const res = await client.query(
      "SELECT id, email, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as joined_at FROM waitlist ORDER BY created_at DESC;"
    );

    console.log(`\n🎉 Total Submissions: ${res.rows.length}\n`);
    if (res.rows.length === 0) {
      console.log("No submissions yet.");
    } else {
      console.table(res.rows);
    }
    await client.end();
  } catch (err) {
    console.error("Error fetching waitlist:", err.message);
    process.exit(1);
  }
}

main();
