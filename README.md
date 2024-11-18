# FeedAll - Blockchain-Powered Food Donation Platform

FeedAll is a revolutionary platform that connects food donors with those in need, leveraging blockchain technology to ensure transparency and accountability in the food donation process.

## Features

- **Smart Contract Integration**: Secure and transparent donation tracking using blockchain technology
- **Real-time Donation Status**: Track donations from creation to delivery
- **Verification System**: Multi-step verification process to ensure donation quality and authenticity
- **User Roles**: Support for donors, administrators, and delivery partners
- **Evidence Management**: Upload and manage verification images and documentation
- **Impact Tracking**: Monitor and showcase the social impact of donations

## Architecture

### Frontend
- Next.js 13+ with App Router
- TypeScript for type safety
- Modern UI with responsive design
- Real-time updates using WebSocket

### Backend
- Node.js/TypeScript backend
- Prisma ORM for database management
- PostgreSQL database
- Ethers.js for blockchain integration
- Jest for testing

### Blockchain
- Smart contracts for donation verification
- Ethereum blockchain integration
- Transparent transaction history

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Ethereum wallet (MetaMask recommended)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/feedall.git
cd feedall
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=localhost

# Backend (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/feedall"
JWT_SECRET=your_jwt_secret
BLOCKCHAIN_PRIVATE_KEY=your_private_key
```

4. Set up the database:
```bash
cd backend
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Start frontend (from root directory)
npm run dev

# Start backend (from backend directory)
npm run dev
```

## Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test
```

## API Documentation

### Donation Endpoints
- `POST /api/donations`: Create a new donation
- `PUT /api/donations/:id/status`: Update donation status
- `GET /api/donations`: List all donations
- `GET /api/donations/:id`: Get donation details

### User Endpoints
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: User login
- `GET /api/users/profile`: Get user profile

## Security

- JWT authentication
- Role-based access control
- Secure blockchain transactions
- Input validation and sanitization
- Rate limiting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Ethers.js](https://docs.ethers.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Contact

For questions and support, please email: support@feedall.com

---

Built with ❤️ for making food donation transparent and efficient.
