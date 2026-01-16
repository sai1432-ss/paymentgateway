# Multi-Channel Payment Gateway System

A robust, containerized **Payment Gateway simulation** built using a **Node.js microservice architecture**.  
The system separates **Merchant operations** and **Customer checkout flows**, closely mirroring real-world payment gateway behavior.

---

## 🚀 Quick Start (Docker)

### Start the System
docker-compose up --build

Verify Installation

API Health: http://localhost:8000/health

Merchant Dashboard: http://localhost:3000

Customer Checkout: http://localhost:3001

In postman api generate a order_id by using postman api call 

POST http://localhost:8000/api/v1/orders

Headers-

X-Api-Key - key_test_abc123

X-Api-Secret - secret_test_xyz789

Json Body -
{ 
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123",
    "notes": {
        "customer_name": "ABCD"
    }    
}

Then order_id will be generated the use that id for checkout.

http://localhost:3001/checkout?order_id={order_id}




🛠️ Tech Stack
Backend
Node.js with Express.js

PostgreSQL 15


Frontend
React.js with TypeScript

Single codebase with dual-port deployment

Infrastructure
Docker

Docker Compose

🏗️ Implementation Details
1. Database Schema & Seeding
On first launch, the system automatically:

Creates database tables

Seeds a test merchant for evaluation

Tables

Merchants – Stores API keys and secrets

Orders – Tracks transaction intent (created, captured, failed)

Payments – Stores UPI/Card payment attempts

2. Multi-Port Frontend Isolation

A single React codebase is deployed across two isolated ports:


Rules:

Merchant UI redirects if /checkout is accessed

Checkout UI blocks merchant-only routes

3. Payment Simulation Logic
Payments are simulated to mimic real payment gateway behavior.

Configuration

UPI success rate: 90%

Card success rate: 95%

Processing delay: 5–10 seconds

📡 API Endpoints (v1)
All protected routes require:

Endpoint	Method	Description

/health	GET	System health check

/api/v1/orders	POST	Create a payment order

/api/v1/orders/:id	GET	Retrieve order details

/api/v1/payments	POST	Initiate UPI/Card payment

/api/v1/payments/:id	GET	Check payment status

/api/v1/test/merchant	GET	Seed verification

🧪 Test Credentials

API Headers

X-Api-Key: key_test_abc123

X-Api-Secret: secret_test_xyz789
