#!/bin/bash
echo "Starting N.E.S.T Backend Server..."
echo "Make sure you have GOOGLE_API_KEY set in your .env file"
cd api
uvicorn main:app --host 127.0.0.1 --port 8000 --reload 