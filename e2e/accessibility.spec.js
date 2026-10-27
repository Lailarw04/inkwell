// e2e/accessibility.spec.js
//
// A lightweight automated check standing in for the manual accessibility
// audit from Lecture 7 — catches regressions between full manual reviews.
    
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("feed page has no automatically detectable accessibility violations", async ({ page }) => {
    page.on("console", (msg) => console.log("BROWSER:", msg.text()));
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
    page.on("response", (res) => {
        if (res.status() >= 400) console.log(res.status(), res.url());
    });
    
    await page.goto("http://localhost:5173/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
});