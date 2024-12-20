
<p align="center">
<img src="readmeImg.png">
</p>

&nbsp;

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
[![first-timers-only Friendly](https://img.shields.io/badge/first--timers--only-friendly-blue.svg)](http://www.firsttimersonly.com/)

# Tagatalk Backend Repository

This is the backend repository for the Tagatalk project, aimed at fostering the use of the Tagalog language among younger generations. Built using NestJS, Prisma, and PostgreSQL.

## Functionalities ✨
1. API endpoints for user authentication, game assets, and email verification.
2. Integration with AWS S3 for game asset management.
3. OpenAI API for language-related functionalities.
4. Email notifications using Tagatalk’s email service.
5. PostgreSQL database management with Prisma ORM.

## Setup ✨

### Prerequisites
1. Install [Node.js](https://nodejs.org/) and a package manager (npm, yarn, etc.).
2. Install [PostgreSQL](https://www.postgresql.org/).

### Installation

1. Clone the Backend Repository:
   ```bash
   git clone https://github.com/keathkeather/TagatalkBackend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd TagatalkBackend
   ```
3. Install dependencies:
   ```bash
   npm install
   # Or, if using yarn:
   yarn install
   ```
4. Create a local environment file `.env` and add the following variables:
   - `SALT`
   - `SECRET_KEY`
   - `AWS_S3_REGION`
   - `AWS_ACCESS_KEY`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BUCKET_NAME`
   - `AWS_PROFILE_BUCKET_NAME`
   - `AWS_GAME_ASSET_TESTING`
   - `OPENAI_API_KEY`
   - `EMAIL_USER` (Tagatalk Email)
   - `EMAIL_PASS` (Tagatalk Email Password)
   - `VERIFICATION_IP`
   - `VERIFICATION_URL`
   - `DATABASE_URL` (PostgreSQL database URL)

5. Update the `schema.prisma` file in the cloned repository to use your local PostgreSQL database address.

6. Run Prisma migrations to set up the database:
   ```bash
   npx prisma migrate
   ```

7. Start the backend server locally:
   ```bash
   npm run start:dev
   ```

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://keath.vercel.app"><img src="https://avatars.githubusercontent.com/u/67945664?s=400&v=4?s=100" width="100px;" alt="Keath Ian Lavador"/><br /><sub><b>Keath Ian Lavador</b></sub></a><br />💻🎨👀🔧</td>
      <td align="center" valign="top" width="14.28%"><a href="#"><img src="https://avatars.githubusercontent.com/u/132324382?v=4?s=100" width="100px;" alt="Rynze Rj Lozano"/><br /><sub><b>Rynze Rj Lozano</b></sub></a><br />💻🎨</td>
      <td align="center" valign="top" width="14.28%"><a href="#"><img src="https://avatars.githubusercontent.com/u/134193612?v=4?s=100" width="100px;" alt="Shania Canoy"/><br /><sub><b>Shania Canoy</b></sub></a><br />💻🎨</td>
      <td align="center" valign="top" width="14.28%"><a href="#"><img src="https://avatars.githubusercontent.com/u/143623220?v=4?s=100" width="100px;" alt="Rustico John Ylaya"/><br /><sub><b>Rustico John Ylaya</b></sub></a><br />💻 🎨</td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Thanks ✨

A huge thanks to [Neon](https://neon.tech) for providing the PostgreSQL hosting services for the Tagatalk backend development needs.

Feel free to fork the repository and contribute! ✨ Good luck and enjoy building with Tagatalk! 😊
