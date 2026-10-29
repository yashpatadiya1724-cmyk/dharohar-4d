import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import SolarEstimateRequest
from app.services.solar_service import calculate_solar_feasibility

class TestSolarEngine(unittest.TestCase):
    def test_solar_feasibility_residential(self):
        req = SolarEstimateRequest(
            monthly_bill_rs=2200.0,
            roof_area_sqm=30.0,
            shading="low"
        )
        res = calculate_solar_feasibility(req)
        self.assertGreater(res.recommended_kw, 0)
        self.assertGreaterEqual(res.subsidy_amount_rs, 30000.0)
        self.assertGreater(res.annual_savings_rs, 0)
        self.assertLess(res.payback_years, 6.0)
        self.assertGreater(len(res.cashflow_25yr), 0)

    def test_solar_roof_constraint(self):
        req = SolarEstimateRequest(
            monthly_bill_rs=8000.0,
            roof_area_sqm=10.0,
            shading="none"
        )
        res = calculate_solar_feasibility(req)
        self.assertEqual(res.recommended_kw, 1.0)

if __name__ == "__main__":
    unittest.main()
