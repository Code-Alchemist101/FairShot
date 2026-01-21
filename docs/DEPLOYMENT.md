# FairShot Deployment Guide

This guide explains how to deploy the FairShot monorepo to Vercel, ensuring the **Landing Page** is the main entry point and the **Web App** is accessible via a subdomain.

## 1. Project Structure

You will create **two separate Vercel projects** from the same GitHub repository:

| Project Name | Source Path | URL (Example) | Purpose |
| :--- | :--- | :--- | :--- |
| **FairShot Landing** | `apps/landing` | `fairshot.com` | Marketing, SEO, Entry Point |
| **FairShot App** | `apps/web` | `app.fairshot.com` | The MVP Product |

---

## 2. Deploying the Landing Page (`apps/landing`)

1.  **New Project**: Go to Vercel Dashboard → "Add New..." → "Project".
2.  **Import Repo**: Select `FairShot`.
3.  **Configure Project**:
    *   **Project Name**: `fairshot-landing` (or similar).
    *   **Framework Preset**: Next.js (Auto-detected).
    *   **Root Directory**: Click "Edit" and select `apps/landing`.
4.  **Deploy**: Click "Deploy".

## 3. Deploying the Web App (`apps/web`)

1.  **New Project**: Go to Vercel Dashboard → "Add New..." → "Project".
2.  **Import Repo**: Select `FairShot` (again).
3.  **Configure Project**:
    *   **Project Name**: `fairshot-web` (matches your existing settings).
    *   **Framework Preset**: Next.js (Auto-detected).
    *   **Root Directory**: Click "Edit" and select `apps/web`.
4.  **Environment Variables**:
    *   Add any required variables (e.g., `DATABASE_URL`, `NEXT_PUBLIC_API_URL`) in "Settings" → "Environment Variables".
5.  **Deploy**: Click "Deploy".

## 4. Connecting Them

The Landing Page needs to link to the App.

1.  **Get App URL**: Once `apps/web` is deployed, copy its domain (e.g., `fairshot-web.vercel.app`).
2.  **Update Landing Page**:
    *   In `apps/landing/app/page.tsx`, the "Start Hiring" and "Public Beta Live" buttons are already set to pointing to `https://fairshot-web.vercel.app`.
    *   *If you have a custom domain (e.g., `app.fairshot.com`), update the link in the code and redeploy `apps/landing`.*

## 5. Verification

1.  Visit the Landing Page URL.
2.  Click "Start Hiring".
3.  Verify it redirects to the Web App.
