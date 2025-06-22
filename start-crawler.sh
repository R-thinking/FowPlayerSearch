#!/bin/bash

echo "🚀 Starting FOW Crawler Application..."
echo "=================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js and try again."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Install Python dependencies if needed
if [ ! -d "python_api/__pycache__" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

# Install Node dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    echo ""
fi

echo "🎯 Starting all services..."
echo "- Vite dev server (React)"
echo "- Python Flask API (Crawler)"
echo "- Electron app"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================="

# Start the full application
npm run dev:full 