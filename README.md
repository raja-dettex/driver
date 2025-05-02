# Driver
*A Decentralized Micro Task Management Platform*

## Overview

**Driver** is a decentralized micro task management app that enables creators and users to upload simple tasks in exchange for crypto payments. The platform connects task creators with contributors (workers) who complete micro-tasks such as voting on the best image or selecting the most relevant option.

### Example Task

- **Task**: "Pick the best thumbnail"
- **Creator** uploads a set of images.
- **Workers** vote on the best one.
- **Reward**: Workers receive a share of the crypto payment based on their contribution.

## Features

-  **Crypto Wallet Integration** for task payments and rewards.
-  **Media Uploads**: Task creators can upload images or files for context.
-  **Decentralized Voting**: Transparent task evaluation by workers.
-  **Micro-rewards** for each valid contribution.
-  **Object Storage** using MinIO for efficient media handling.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/)  
- **Backend**: [Node.js](https://nodejs.org/)  
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)  
- **Media Storage**: [MinIO](https://min.io/) (S3-compatible object storage)

## Getting Started

Follow the steps below to run the project locally:

### 1. Backend Setup

```bash
cd backend
npx prisma migrate dev     # Apply database migrations
npm start                  # Start the backend server
```
### 2. start the user app
```bash
cd user-frontend
npm run dev
```

### 2. start the worker app
```bash
cd worker-app
npm run dev
``` 
