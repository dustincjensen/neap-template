# neap-template

An Angular (2 and up), Full Typescript, Node, Express, Postgresql template.

# Why?

I was frustrated with the lack of online tutorials about using Typescript for the entire stack in Node applications on the web. I based my initial design off of this excellent [example](http://brianflove.com/2016/11/08/typescript-2-express-node/).

# What does this offer?

The largest advantage to using this template is code generation.

- Proxy is generated from @decorators on the API classes and methods.
- Database Create table (for Postgresql) schemas are generated by marking models with @decorators. The same decorators will also generate the basic CRUD functionality that a project might need.
- PROPOSED: The auto generation of .sql test data from @decorators on the model.

This template also offers a lot of other things.

- A database layer wrapper for making sure all calls happen inside the same transaction without you ever having to commit or rollback manually ever again.
- A wrapped API layer so that you don't have to handle the request, response, next variables ever again. Just create a new API class, decorate as appropriate and be on your way.
- Some base styles to get you off the ground and designing your pages faster.
- A flexbox based grid and grid-column SCSS classes.
- Alerts, buttons and form control styles.

# How do I get up and running?

1. Install Node 7.0^ (to stay consistent with my current environment).
2. Install Postgresql
3. Create an database in Postgres.
4. Open a terminal and run the following commands.
```
git clone https://github.com/dustincjensen/neap-template
cd neap-template
npm install
```
5. Create a copy of .example.env rename it to .env
6. Set username and password in .env to match what you used for your Postgres database you created in the previous step. Set the database name if it doesn't match as well (it defaults to dev).
```
npm run grunt full
npm run dev
```
7. You should now be able to create and delete 'Examples' using the pre-rendered example page.

# Where to start?

Coming soon.