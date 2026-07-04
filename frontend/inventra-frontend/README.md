<div align="center">

# 📦 Inventra
### Enterprise Warehouse Inventory Management System

<p align="center">
A modern, full-stack inventory management platform built with <b>Spring Boot</b> and <b>React</b> that enables organizations to efficiently manage products, suppliers, categories, stock movements, low-stock alerts, and inventory analytics through a secure and scalable architecture.
</p>

<p align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=for-the-badge&logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

</p>

</div>

---

## 📖 About The Project

Managing inventory using spreadsheets or disconnected software often leads to inaccurate stock records, missing audit trails, delayed restocking decisions, and inefficient warehouse operations.

**Inventra** is a production-inspired Warehouse Inventory Management System designed to solve these challenges by providing a centralized platform for inventory tracking, stock movement management, supplier management, category management, analytics, and automated low-stock monitoring.

Unlike traditional CRUD-based inventory applications, Inventra emphasizes **inventory integrity**, **auditability**, and **business-oriented workflows** by recording every stock movement through dedicated inventory transactions instead of directly modifying stock values.

The application follows a modern layered architecture using Spring Boot on the backend and React on the frontend, making it scalable, maintainable, and suitable for real-world warehouse environments.

---

## 🎯 Problem Statement

Warehouses and retail businesses frequently encounter several operational challenges:

- Missing audit trails for stock changes
- Manual inventory tracking
- Product over-selling due to inaccurate stock
- Difficulty identifying low-stock items
- Poor supplier and category organization
- Lack of inventory analytics
- Time-consuming stock reconciliation

Inventra addresses these issues through automated inventory management workflows, transaction-based stock adjustments, intelligent dashboards, and structured inventory reporting.

---

## ✨ Key Highlights

- 📦 Complete Product Management
- 📊 Interactive Dashboard Analytics
- 🔄 Transaction-Based Inventory Updates
- 📉 Automated Low Stock Detection
- 🏢 Supplier Management
- 🗂 Category Management
- 📜 Complete Inventory History
- ⚡ Optimistic Locking for Concurrent Updates
- 🧾 Inventory Audit Trail
- 🔍 Advanced Filtering & Pagination
- 📈 Inventory Analytics
- 📤 CSV Export Support
- 🎨 Responsive React UI

---

## 🚀 Core Features

### 📦 Product Management

- Create Products
- Update Product Details
- Soft Delete Products
- SKU Validation
- Product Search
- Pagination
- Inventory Status Indicators

---

### 🔄 Inventory Transactions

Every inventory modification is performed through a dedicated transaction instead of directly updating stock.

Supported transaction types include:

- Initial Stock
- Restock
- Sale
- Stock Adjustment
- Manual Correction

Each transaction records:

- Product
- Quantity
- Transaction Type
- Operator
- Timestamp

This provides complete inventory traceability.

---

### 📊 Dashboard

The dashboard provides a quick overview of warehouse operations.

Includes:

- Total Products
- Active Categories
- Active Suppliers
- Low Stock Items
- Inventory Distribution
- Stock Movement Analytics
- Summary Cards
- Charts

---

### 📉 Low Stock Monitoring

Products falling below their configured threshold are automatically identified and highlighted.

Managers can quickly identify products requiring replenishment before stock-outs occur.

---

### 🏢 Supplier Management

Manage supplier information including:

- Supplier Details
- Contact Information
- Product Association
- Supplier-wise Inventory

---

### 🗂 Category Management

Organize products using categories for easier inventory management and reporting.

---

### 📜 Inventory History

Every inventory operation is permanently recorded.

Users can:

- View Transaction History
- Filter Transactions
- Search by Product
- Track Inventory Changes

---

### 📈 Reporting

Generate business insights through:

- Product Reports
- Transaction Reports
- Stock Reports
- Dashboard Analytics

---

## 🌟 Why Inventra?

Inventra was built by applying software engineering best practices rather than implementing basic CRUD operations.

Key architectural decisions include:

- Layered Architecture
- DTO-based API Design
- Entity Mapping
- Global Exception Handling
- Optimistic Locking
- Service-Oriented Business Logic
- Inventory Audit Trail
- Soft Delete Strategy
- Validation-Driven APIs

These practices make the application closer to production-grade enterprise software.

---
