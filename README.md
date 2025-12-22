# Multi-Tenant E-Commerce Platform with Recommendation System

A production-grade, multi-tenant e-commerce platform built as a full business MVP.

This project demonstrates how I design and implement real-world backend systems for startups, including microservices, multi-tenant data separation, caching, and a practical recommendation system.

Although the product was not launched commercially, the system was built end-to-end to reflect production-level architecture and complexity.

---

## Features

### Multi-Tenant Architecture
- Supports multiple independent sellers on a single platform
- Seller-specific products, orders, and dashboards
- Role-based access control (admin, seller, customer)
- Clean separation of tenant data

### Backend Services
- Microservices-based architecture
- REST APIs built with Node.js and Express
- MongoDB for core data storage
- Redis for caching and performance optimization
- Secure authentication and authorization
- Centralized error handling and request validation
- Environment-based configuration

### Frontend Applications
- Customer-facing application built with Next.js
- Admin panel for platform management and oversight
- Seller dashboard for product and order management
- Modern UI built with shadcn/ui

### Recommendation System
- Implemented using TensorFlow
- Generates personalized product recommendations
- Integrated directly into the platform’s data flow
- Demonstrates applied machine-learning in a real product context

### Media Handling
- ImageKit integration for image upload, optimization, and delivery

---

## Tech Stack

Backend
- Node.js
- Express.js
- MongoDB
- Redis

Frontend
- Next.js
- shadcn/ui

Machine Learning
- TensorFlow (recommendation engine)

Infrastructure & Tools
- ImageKit
- RESTful API architecture

---

## Architecture Overview

The system is composed of multiple services, each responsible for a specific domain (users, products, orders, recommendations).

This architecture enables:
- Independent service scaling
- Easier maintenance and iteration
- Clear separation of concerns
- SaaS-style multi-tenant patterns commonly used in startups

---

## Use Cases

- SaaS-style e-commerce platforms
- Marketplaces with multiple sellers
- Startup MVPs requiring scalable backend design
- Applications requiring basic recommendation systems
- Reference implementation for microservices and ML integration

---

## Project Status

This project is no longer under active development.

It was built as a full MVP and business experiment and is kept public as a reference for architecture, backend design, and real-world system complexity.

---

## About Me

I’m a freelance backend developer specializing in:
- MVP backends
- REST APIs
- Multi-tenant systems
- Microservices
- Bug fixes and performance optimization

Most of my recent work has been with startup teams on private repositories and production applications.

---

## License

This project is licensed under the Apache License 2.0.