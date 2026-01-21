Zero is a query-driven sync engine for TypeScript apps. It replicates Postgres into a SQLite replica inside `zero-cache`, then syncs subsets of rows to clients based on the queries your app runs. Client reads/writes hit local storage first (instant UI); `zero-cache` keeps clients up to date via logical replication.

Recommended reading order for wiring a Zero app: Install -> Schema -> Queries -> Auth -> Mutators -> ZQL -> Deployment/Config -> Debugging

## Key mental models

### Queries

- Clients do NOT send arbitrary queries to `zero-cache`.
- You define named Queries and Mutators in code (`defineQueries`, `defineMutators`).
- The client runs its own ZQL optimistically against a local store (e.g. IDB), and `zero-cache` calls your server endpoints (`ZERO_QUERY_URL`, `ZERO_MUTATE_URL`) to resolve a name+args into ZQL/logic, where you also enforce permissions via `context`. `zero-cache` runs ZQL against its SQLite replica.

### Mutators

- Mutators also run on the client optimistically first.
- The client can also query the local store in mutators, but a query must exist that is _active_ for the data to exist in the local store.
- Mutations are then sent to `zero-cache`, which calls your server's `ZERO_MUTATE_URL` endpoint, where they run directly against Postgres upstream.

### Performance

- Queries **must** be optimized by using the `npx analyze-query` or Inspector. The query plan commonly has `TEMP B-TREE` when it is not optimized. You should be cautious when adding complex/heavy queries that are not properly indexed in Postgres, since `zero-cache` derives indexes from upstream.
- ZQL adds all primary key columns to the `orderBy` clause for a predictable total order, but only appends those PK columns which are not already present in the order of the query. This means that upstream indexes must also include the PK columns.

### Warnings/common pitfalls

- Treat query results as immutable (e.g. don't mutate returned objects from `useQuery`).
- Prefer client-generated random IDs passed into mutators over auto-increment IDs (e.g. using `uuidv7` or `nanoid`).
- Do not generate IDs inside mutators, since mutators run multiple times (sometimes twice on the client and once on the server).
- When auth errors occur, the client must reconnect manually using the Connection Status API.
- Prefer creating migrations and executing them against the local database. Resetting the database during local development requires also deleting the SQLite replica.
