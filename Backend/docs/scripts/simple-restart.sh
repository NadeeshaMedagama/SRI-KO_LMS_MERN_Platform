#!/bin/bash

# Simple Server Restart
echo "==================================="
echo "Simple Server Restart"
echo "==================================="
echo ""

cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN/Backend

echo "1. Killing existing processes..."
killall -9 node 2>/dev/null
sleep 2

echo "2. Starting server..."
npm start

# That's it - server should start in foreground

