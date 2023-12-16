This is a starter boilerplate for Next.js 14. It had everything you need to kickstart an app with full authentication.

## Features

- Sequelize ORM with a `User` model defined (extend as you please)
- A `docker-compose` to spin up a quick Postgres DB
- A sync and seed function with a custom page to execute and populate the database
- A site-wide app context that stores our public user data
- A user menu in the header with an avatar icon
- Middleware route protection based on authentication status and/or role
- TailwindCSS + Daisy UI for the UI
- CloudFlare Turnstile to protect the login form

## Getting started

Simply clone this repo and create a `.env` file with the following vars:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD="+IcoKg1B530IWS+MnPXcnsFqGXvXu1T6/96GoqgL7oo="
POSTGRES_DATABASE=postgres
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your_turnstile_site_key"
TURNSTILE_SECRET_KEY="your_turnstile_secret_key"
JWT_SECRET="a_32_byte_secure_string"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

To generate your JWT secret, simply run:

```
openssl rand -base64 32
```

If you're on Windows, you can use node:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

To use the dev database, you need to install `Docker` and `docker-compose`. If you're in a Windows environment, you can download and install the `Docker Deskop` app. It really simplifies managing your Docker containers and it uses `Windows Subsystem for Linux (WSL)`.

To startup the database, just run:

```
docker-compose up
```

Be sure that your password in the `.env` file matches the password in the `docker-compose.yml` file.

## Seeding the DB

I created a DB tools page at `/dev/db`. You need to open the `page.tsx` file and set `EXECUTE=true`. That's there to prevent inadvertent execution and tanking your DB.

There're two buttons:

- Sync DB: syncs the User sequelize model with the database, creates the database and table if it doesn't exist
- Seed Users: inserts two dummy users, one with a `customer` role and one with an `admin` role

*Be sure to set `EXECUTE=false` when you're done!*

## Setting up CloudFlare Turnstile

If you do not already have a CloudFlare account, I strongly encourage you to create one. CloudFlare provides a myriad of services to the public completely for free. They're a for-profit company, but they are basically a public utility. Creating a Turnstile site is pretty easy and strait forward. There are two main reasons I use Turnstile:

1. It's privacy practices are impeccable (as compared to Google reCaptcha)
2. It's super user-friendly (unlike hCaptcha)

## Logging in and testing

The two login accounts are:

- john@example.com : 12345 (admin)
- jane@example.com : 12345 (customer)

I know, the password is the kind an idiot would have on his luggage. 😂

When you log in, two cookies are set:

- `token`: this cookie contains the encoded JWT that is only decodable by the server
- `userData`: this cookie contains public user data from the DB (for profile display)

Upon successful login, we run `loadUserData()` from the `AppProvider` context. This loads the `userData` cookie information into our `userData` state in our app context. You'll notice that once you log in, the user menu avatar should instantly change to the user's picture.

The TTL for `userData` in the app context is set to 5 minutes. Every route change, it checks to see if the TTL has expired. Once it expires, it makes a request to `/api/auth`. That endpoint pulls the user from the database, checks to see if the user has an active status. If the user is not active, the server deletes the cookie and the user is logged out. This is also important for keeping the public user data in sync. So you if you, for example, change a parameter on your phone, the change will be update on your desktop in no more than 5 minutes.

## Getting help

Please feel free to email the author: jay@designly.biz

Also, please visit my profile site for more cool stuff! https://jay.designly.biz

Happy coding!