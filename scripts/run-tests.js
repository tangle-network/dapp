#!/usr/bin/env node

process.env.NODE_OPTIONS = `--experimental-vm-modules${process.env.NODE_OPTIONS ? ` ${process.env.NODE_OPTIONS}` : ''}`;

// eslint-disable-next-line
require('jest-cli/bin/jest');
