#!/usr/bin/env python3
"""
Dharohar 4D — Simulation Runner & HTML Report Generator
PRD Section 10.6: Automated integration test suite with heritage-themed report.

Usage:
    python scripts/simulate.py              # runs against http://127.0.0.1:8000
    python scripts/simulate.py --base-url http://localhost:3001
    python scripts/simulate.py --report-dir ./custom_reports
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import httpx
except ImportError:
    print("ERROR: httpx not installed. Run: pip install httpx")
    sys.exit(1)

# ───────────────────────────── Paths ──────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
TEST_CASES_PATH = SCRIPT_DIR / "test_cases.json"
DEFAULT_REPORT_DIR = SCRIPT_DIR.parent / "reports"

# ───────────────────────────── Theme Colors ───────────────────────────────
BG      = "#0F1115"
GOLD    = "#C8963E"
INDIGO  = "#2B3A67"
VERMIL  = "#B5362B"
GREEN   = "#2ECC71"
SURFACE = "#1A1D24"
TEXT    = "#E0D6C8"


# ═══════════════════════════════════════════════════════════════════════════
# SimulationRunner
# ═══════════════════════════════════════════════════════════════════════════

class SimulationRunner:
    """Runs all test cases against a live API and generates a report."""

    def __init__(self, base_url: str, report_dir: Path):
        self.base_url = base_url.rstrip("/")
        self.report_dir = Path(report_dir)
        self.report_dir.mkdir(parents=True, exist_ok=True)
        self.results: list[dict] = []

    # ── load test cases ──────────────────────────────────────────────────
    def load_cases(self) -> list[dict]:
        with open(TEST_CASES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    # ── run one case ─────────────────────────────────────────────────────
    def run_case(self, case: dict) -> dict:
        url = f"{self.base_url}{case['path']}"
        method = case["method"].upper()
        body = case.get("body")
        t0 = time.perf_counter()
        error = None
        status_code = 0
        response_body = None
        passed = False

        try:
            with httpx.Client(timeout=15.0) as client:
                if method == "GET":
                    r = client.get(url)
                elif method == "POST":
                    r = client.post(url, json=body)
                elif method == "PUT":
                    r = client.put(url, json=body)
                elif method == "DELETE":
                    r = client.delete(url)
                else:
                    raise ValueError(f"Unsupported method: {method}")

                status_code = r.status_code
                try:
                    response_body = r.json()
                except Exception:
                    response_body = r.text[:500]

        except httpx.ConnectError:
            error = f"Connection refused: {url}"
        except httpx.TimeoutException:
            error = f"Timeout: {url}"
        except Exception as e:
            error = str(e)

        elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)

        # ── evaluate pass/fail ───────────────────────────────────────
        if error:
            passed = False
        else:
            passed = True
            # Check status
            if "expect_status" in case and status_code != case["expect_status"]:
                passed = False
                error = f"Expected status {case['expect_status']}, got {status_code}"

            # Check required keys
            if passed and "expect_keys" in case and isinstance(response_body, dict):
                missing = [k for k in case["expect_keys"] if k not in response_body]
                if missing:
                    passed = False
                    error = f"Missing keys: {missing}"

            # Check list type
            if passed and case.get("expect_type") == "list":
                if not isinstance(response_body, list):
                    passed = False
                    error = f"Expected list, got {type(response_body).__name__}"
                elif "expect_min_length" in case and len(response_body) < case["expect_min_length"]:
                    passed = False
                    error = f"List too short: {len(response_body)} < {case['expect_min_length']}"

        result = {
            "id": case["id"],
            "category": case["category"],
            "name": case["name"],
            "method": method,
            "path": case["path"],
            "status_code": status_code,
            "elapsed_ms": elapsed_ms,
            "passed": passed,
            "error": error,
        }
        self.results.append(result)
        return result

    # ── run all ──────────────────────────────────────────────────────────
    def run_all(self) -> list[dict]:
        cases = self.load_cases()
        total = len(cases)
        print(f"\n{'═'*60}")
        print(f"  🏛️  DHAROHAR 4D — Simulation Runner")
        print(f"  Target: {self.base_url}")
        print(f"  Cases : {total}")
        print(f"{'═'*60}\n")

        for i, case in enumerate(cases, 1):
            result = self.run_case(case)
            icon = "✅" if result["passed"] else "❌"
            print(f"  {icon} [{result['id']}] {result['name']:<35} "
                  f"{result['status_code']:>3}  {result['elapsed_ms']:>8.1f}ms"
                  f"{'  ⚠ ' + (result['error'] or '') if not result['passed'] else ''}")

        # Summary
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        print(f"\n{'─'*60}")
        print(f"  Results: {passed} passed, {failed} failed, {total} total")
        print(f"{'─'*60}\n")
        return self.results

    # ── generate HTML report ─────────────────────────────────────────────
    def generate_report(self) -> str:
        ts = datetime.now()
        filename = f"sim_{ts.strftime('%Y%m%d_%H%M%S')}.html"
        filepath = self.report_dir / filename

        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        pass_rate = (passed / total * 100) if total else 0

        # Group by category
        categories: dict[str, list[dict]] = {}
        for r in self.results:
            categories.setdefault(r["category"], []).append(r)

        # Build category summary cards
        cat_cards = ""
        for cat, items in categories.items():
            p = sum(1 for i in items if i["passed"])
            f = len(items) - p
            color = GREEN if f == 0 else VERMIL
            cat_cards += f"""
            <div class="cat-card">
                <div class="cat-name">{cat}</div>
                <div class="cat-stats" style="color:{color}">{p}/{len(items)}</div>
            </div>"""

        # Build results table rows
        rows = ""
        for r in self.results:
            status_class = "pass" if r["passed"] else "fail"
            status_text = "PASS" if r["passed"] else "FAIL"
            err_cell = r["error"] or "—"
            rows += f"""
                <tr class="{status_class}">
                    <td><code>{r['id']}</code></td>
                    <td>{r['category']}</td>
                    <td>{r['name']}</td>
                    <td><code>{r['method']}</code></td>
                    <td class="path-cell"><code>{r['path']}</code></td>
                    <td>{r['status_code']}</td>
                    <td>{r['elapsed_ms']}ms</td>
                    <td class="status-badge {status_class}">{status_text}</td>
                    <td class="err-cell">{err_cell}</td>
                </tr>"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dharohar 4D — Simulation Report</title>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    background: {BG};
    color: {TEXT};
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    padding: 2rem;
  }}
  .header {{
    text-align: center;
    padding: 2rem 0;
    border-bottom: 2px solid {GOLD};
    margin-bottom: 2rem;
  }}
  .header h1 {{
    font-size: 2rem;
    color: {GOLD};
    letter-spacing: 2px;
  }}
  .header .subtitle {{
    color: #888;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }}
  .summary {{
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin: 2rem 0;
    flex-wrap: wrap;
  }}
  .summary-card {{
    background: {SURFACE};
    border-radius: 12px;
    padding: 1.5rem 2rem;
    text-align: center;
    min-width: 150px;
    border: 1px solid #2a2d35;
  }}
  .summary-card .num {{
    font-size: 2.5rem;
    font-weight: 700;
  }}
  .summary-card .label {{
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}
  .num.green {{ color: {GREEN}; }}
  .num.red   {{ color: {VERMIL}; }}
  .num.gold  {{ color: {GOLD}; }}
  .num.blue  {{ color: {INDIGO}; }}
  .categories {{
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin: 1.5rem 0;
  }}
  .cat-card {{
    background: {SURFACE};
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    border: 1px solid #2a2d35;
    text-align: center;
  }}
  .cat-name {{ font-size: 0.8rem; color: #888; }}
  .cat-stats {{ font-size: 1.4rem; font-weight: 700; }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.85rem;
  }}
  th {{
    background: {INDIGO};
    color: {GOLD};
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 600;
    letter-spacing: 0.5px;
  }}
  td {{
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid #1e2128;
  }}
  tr.pass {{ background: rgba(46,204,113,0.05); }}
  tr.fail {{ background: rgba(181,54,43,0.1); }}
  tr:hover {{ background: rgba(200,150,62,0.08); }}
  .status-badge {{
    font-weight: 700;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 4px;
  }}
  .status-badge.pass {{ color: {GREEN}; background: rgba(46,204,113,0.15); }}
  .status-badge.fail {{ color: {VERMIL}; background: rgba(181,54,43,0.15); }}
  .path-cell {{ max-width: 280px; word-break: break-all; }}
  .err-cell {{ color: #e67e73; font-size: 0.8rem; max-width: 200px; }}
  code {{ font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.82rem; }}
  .footer {{
    text-align: center;
    padding: 2rem 0;
    color: #555;
    font-size: 0.8rem;
    border-top: 1px solid #222;
    margin-top: 2rem;
  }}
</style>
</head>
<body>

<div class="header">
  <h1>🏛️ DHAROHAR 4D — Simulation Report</h1>
  <div class="subtitle">
    HC26-CULT01 | Neural Heritage Digital Twin & Epigraphy Engine<br>
    Generated: {ts.strftime('%d %b %Y, %H:%M:%S')} | Target: {self.base_url}
  </div>
</div>

<div class="summary">
  <div class="summary-card">
    <div class="num gold">{total}</div>
    <div class="label">Total Tests</div>
  </div>
  <div class="summary-card">
    <div class="num green">{passed}</div>
    <div class="label">Passed</div>
  </div>
  <div class="summary-card">
    <div class="num red">{failed}</div>
    <div class="label">Failed</div>
  </div>
  <div class="summary-card">
    <div class="num {'green' if pass_rate == 100 else 'gold'}">{pass_rate:.0f}%</div>
    <div class="label">Pass Rate</div>
  </div>
</div>

<div class="categories">{cat_cards}</div>

<table>
<thead>
  <tr>
    <th>ID</th><th>Category</th><th>Test</th><th>Method</th>
    <th>Path</th><th>Status</th><th>Time</th><th>Result</th><th>Error</th>
  </tr>
</thead>
<tbody>{rows}</tbody>
</table>

<div class="footer">
  Dharohar 4D Simulation Runner — PRD Section 10.6<br>
  Blithchron '27, IIT Gandhinagar
</div>

</body>
</html>"""

        filepath.write_text(html, encoding="utf-8")
        print(f"  📄 Report saved: {filepath}")
        return str(filepath)

    # ── console summary table ────────────────────────────────────────────
    def print_summary(self):
        categories: dict[str, list[dict]] = {}
        for r in self.results:
            categories.setdefault(r["category"], []).append(r)

        print(f"\n  {'Category':<18} {'Pass':>6} {'Fail':>6} {'Total':>6}")
        print(f"  {'─'*40}")
        for cat, items in categories.items():
            p = sum(1 for i in items if i["passed"])
            f = len(items) - p
            print(f"  {cat:<18} {p:>6} {f:>6} {len(items):>6}")


# ═══════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Dharohar 4D Simulation Runner (PRD Section 10.6)"
    )
    parser.add_argument(
        "--base-url", default="http://127.0.0.1:8000",
        help="Base URL of the running Dharohar 4D API"
    )
    parser.add_argument(
        "--report-dir", default=str(DEFAULT_REPORT_DIR),
        help="Directory for HTML report output"
    )
    args = parser.parse_args()

    runner = SimulationRunner(args.base_url, args.report_dir)
    runner.run_all()
    runner.print_summary()
    runner.generate_report()


if __name__ == "__main__":
    main()

