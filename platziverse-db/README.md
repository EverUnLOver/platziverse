# platziverse-db

## Usage

```
js
const setupDatabase = require('platziverse-db')

setupDabase(config).then(db => {
  const { Agent, Metric } = db
}).catch(err => console.error(err))

```

```
NPM
npm i --save-dev standard
npm i sequelize pg pg-hstore --save
npm i debug --save
npm i inquirer chalk --save
mpn i --save-dev ava
npm i --save defaults
npm i sqlite3 --save-dev
npm i nyc --save-dev
npm i --save-dev sinon
npm i proxyquire --save-dev
```

```
NPM RUN
{
  "scripts": {
     "lint": "standard" #options: -- --fix
   }
}
```
