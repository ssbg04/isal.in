---
name: conversion-reliability
description: Fault tolerance, input validation, error boundary recovery, and batch queue resilience across conversion tools. Use when debugging conversion failures, adding error boundaries, or hardening file pipelines.
---

# Conversion Reliability Skill

Use this skill when auditing or improving file validation, error boundaries, or conversion pipeline stability.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/conversion-reliability.md`.
2. Validate file headers, types, and sizes defensively before processing.
3. Wrap tool workspaces in React Error Boundaries with user-friendly reset actions.
4. Ensure failures on individual batch items do not halt the entire queue.
5. Provide actionable, human-readable error messages explaining how to resolve conversion issues.
