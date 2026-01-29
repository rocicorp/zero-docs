Zero is a query-driven sync engine for TypeScript apps. It replicates Postgres into a SQLite replica inside `zero-cache`, then syncs subsets of rows to clients based on the queries your app runs. Client reads/writes hit local storage first (instant UI); `zero-cache` keeps clients up to date via logical replication.

Recommended reading order for wiring a Zero app: Install -> Schema -> Queries -> Auth -> Mutators -> ZQL -> Deployment/Config -> Debugging

## Key mental models

### Queries

- Clients do NOT send arbitrary queries to `zero-cache`.
- You define Queries and Mutators in code (`defineQueries`, `defineMutators`).
- The client runs its own ZQL optimistically against a local store (e.g. IDB), and `zero-cache` calls your server endpoints (`ZERO_QUERY_URL`) to resolve a name+args into ZQL/logic, where you also enforce permissions via `context`. `zero-cache` runs that returned ZQL against its SQLite replica, and returns the authoritative results to the client.
- Queries **must** be optimized, e.g. using `npx analyze-query`. The query plan commonly has `TEMP B-TREE` when it is not optimized. You should be cautious when adding complex/heavy queries that are not properly indexed in Postgres, since `zero-cache` derives indexes from upstream. See Slow Queries below.

### Mutators

- Mutators also run on the client optimistically first.
- The client can query the local store in a mutator, but a query must exist that is _active_ for the data to exist in the local store. See Reading Data for what "active" means.
- Mutations are then sent to `zero-cache`, which calls your server's `ZERO_MUTATE_URL` endpoint, where they run directly against Postgres upstream.

### Warnings/common pitfalls

- Zero types are registered globally with `declare module`.
- Treat query results as immutable (e.g. don't mutate returned objects from `useQuery`).
- Prefer client-generated random IDs passed into mutators over auto-increment IDs (e.g. using `uuidv7` or `nanoid`).
- Do not generate IDs inside mutators, since mutators run multiple times (sometimes twice on the client and once on the server).
- When auth errors occur, the client must reconnect manually using the Connection Status API.
- When developing locally, prefer creating migrations and executing them against the local database. Resetting the database during local development requires also deleting the SQLite replica and restarting `zero-cache`.
