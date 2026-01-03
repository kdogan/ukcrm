#!/bin/bash

# MongoDB Replica Set Setup Script for Ubuntu Server
# This script configures MongoDB to support transactions

set -e

echo "========================================"
echo "MongoDB Replica Set Setup - Ubuntu"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}ERROR: This script must be run as root or with sudo${NC}"
    echo "Please run: sudo bash setup-replica-set-ubuntu.sh"
    exit 1
fi

echo -e "${YELLOW}Checking MongoDB installation...${NC}"

# Find MongoDB config file
CONFIG_FILE=""
if [ -f "/etc/mongod.conf" ]; then
    CONFIG_FILE="/etc/mongod.conf"
elif [ -f "/etc/mongodb.conf" ]; then
    CONFIG_FILE="/etc/mongodb.conf"
else
    echo -e "${RED}ERROR: MongoDB config file not found${NC}"
    echo "Expected locations:"
    echo "  - /etc/mongod.conf"
    echo "  - /etc/mongodb.conf"
    exit 1
fi

echo -e "${GREEN}✓ Found MongoDB config: $CONFIG_FILE${NC}"
echo ""

# Backup existing config
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup of config file...${NC}"
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✓ Backup created at $BACKUP_FILE${NC}"
echo ""

# Check if replication is already configured
if grep -q "^replication:" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠ Replication already configured in $CONFIG_FILE${NC}"
    echo ""
    echo "Current replication config:"
    grep -A 5 "^replication:" "$CONFIG_FILE"
    echo ""
    read -p "Do you want to reconfigure? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping configuration update."
    else
        # Remove old replication config
        sed -i '/^replication:/,/^[a-z]/d' "$CONFIG_FILE"
    fi
fi

# Add replication configuration if not present
if ! grep -q "^replication:" "$CONFIG_FILE"; then
    echo -e "${YELLOW}Adding replication configuration...${NC}"

    cat >> "$CONFIG_FILE" << 'EOF'

replication:
  replSetName: "rs0"
EOF

    echo -e "${GREEN}✓ Configuration updated${NC}"
    echo ""
fi

# Restart MongoDB service
echo -e "${YELLOW}Restarting MongoDB service...${NC}"

# Detect service name (mongod or mongodb)
if systemctl list-units --type=service | grep -q "mongod.service"; then
    SERVICE_NAME="mongod"
elif systemctl list-units --type=service | grep -q "mongodb.service"; then
    SERVICE_NAME="mongodb"
else
    echo -e "${RED}ERROR: MongoDB service not found${NC}"
    echo "Please check if MongoDB is installed correctly."
    exit 1
fi

systemctl restart "$SERVICE_NAME"
echo -e "${GREEN}✓ MongoDB service restarted${NC}"
echo ""

# Wait for MongoDB to start
echo -e "${YELLOW}Waiting for MongoDB to start...${NC}"
sleep 5

# Check if MongoDB is running
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB failed to start${NC}"
    echo "Check logs with: sudo journalctl -u $SERVICE_NAME -n 50"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}Configuration complete!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}Next step: Initialize the replica set${NC}"
echo "Run: cd berater-service && node setup-replica-set.js"
echo ""
