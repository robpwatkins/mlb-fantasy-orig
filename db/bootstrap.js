const faunadb = require('faunadb');

const createCollections = (key) => {
  const q = faunadb.query;

  const client = new faunadb.Client({
    secret: key,
    domain: 'db.us.fauna.com'
  });
  
  client.query(q.CreateCollection({ name: 'users' }))
  .then((res) => console.log('res: ', res))
  .catch((err) => console.error('err: ', err));
  
  client.query(q.CreateCollection({ name: 'teams' }))
  .then((res) => console.log('res: ', res))
  .catch((err) => console.error('err: ', err));
};

const createIndexes = (key) => {
  const q = faunadb.query;
  
  const client = new faunadb.Client({
    secret: key,
    domain: 'db.us.fauna.com'
  });

  client.query(
    q.CreateIndex({
      name: 'users_by_email',
      permissions: { read: 'public' },
      source: q.Collection('users'),
      terms: [{ field: ['data', 'email'] }],
      unique: true
    })
  )
    .then((res) => console.log('res: ', res))
    .catch((err) => console.error('err: ', err));

  client.query(
    q.CreateIndex({
      name: 'teams_by_users',
      source: q.Collection('teams'),
      terms: [{ field: ['data', 'userRef'] }],
    })
  )
    .then((res) => console.log('res: ', res))
    .catch((err) => console.error('err: ', err));
};

const createRoles = (key) => {
  const q = faunadb.query;

  const client = new faunadb.Client({
    secret: key,
    domain: 'db.us.fauna.com'
  });

  client.query(q.CreateRole({
    name: 'players',
    membership: [{ resource: q.Collection('users') }],
    privileges: [
      {
        resource: q.Collection('teams'),
        actions: {
          read: true,
          write: true,
          create: true,
          delete: true,
          history_read: false,
          history_write: false,
          unrestricted_read: false
        }
      },
      {
        resource: q.Index('teams_by_users'),
        actions: {
          unrestricted_read: false,
          read: true
        }
      }
    ]
  }))
    .then((res) => console.log('res: ', res))
    .catch((err) => console.error('err: ', err));
};

if (!process.env.FAUNADB_SECRET) {
  console.error('FaunaDB Secret Key not found!')
} else {
  createCollections(process.env.FAUNADB_SECRET)
  createIndexes(process.env.FAUNADB_SECRET)
  createRoles(process.env.FAUNADB_SECRET)
}