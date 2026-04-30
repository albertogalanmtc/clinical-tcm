#!/bin/bash

echo "🚀 Starting Backend Server..."
echo ""

# Check if server directory exists
if [ ! -d "server" ]; then
  echo "❌ Error: server directory not found"
  exit 1
fi

cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found"
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "⚠️  IMPORTANT: Edit server/.env with your credentials:"
  echo "   - STRIPE_SECRET_KEY"
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_SERVICE_KEY"
  echo ""
  read -p "Press Enter to continue after updating .env..."
fi

echo "🏃 Starting development server..."
echo ""
npm run dev
