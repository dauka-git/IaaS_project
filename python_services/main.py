from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup remains the same
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==== Input Schemas ====
class AutoROIInput(BaseModel):
    years: int
    cards_number: int
    cardType: str
    features: list[str] = []
    starting_number: int
    expected_cards_growth_rate: float

class ManualROIInput(BaseModel):
    explicit_cards_number: Dict[int, int]  # {year: cards_number}
    cardType: str
    features: list[str] = []

class ROI:
    class Automatic_ROI:
        @staticmethod
        def generate_exponential_array(years, base, starting_number, cards_number):
            indices = np.arange(years)
            arr = starting_number * np.power(base, indices)
            churn_rate = 0.1
            arr = arr * (1 - churn_rate)
            return np.minimum(arr, cards_number).astype(int)

        @staticmethod
        def calculate(input: AutoROIInput):
            cardholders = ROI.Automatic_ROI.generate_exponential_array(
                input.years,
                input.expected_cards_growth_rate,
                input.starting_number,
                input.cards_number
            )
            return ROI._core_calculations(cardholders, input)

    class Manual_ROI:
        @staticmethod
        def calculate(input: ManualROIInput):
            # Convert manual input to cardholders array
            max_year = max(input.explicit_cards_number.keys())
            cardholders = np.array([input.explicit_cards_number.get(year, 0) 
                                  for year in range(1, max_year + 1)])
            return ROI._core_calculations(cardholders, input)

    @staticmethod
    def _core_calculations(cardholders, input):
        annual_volumes, annual_counts = ROI._simulate_transactions(cardholders)
        
        yearly_income = np.array([np.sum(v) for v in annual_volumes]) * (0.8*0.018 + 0.2*0.013)
        
        CROSS_BORDER_FEE = 0.0113
        DIGITAL_ENABLEMENT_FEE = 0.000226  
        CLEARING_FEE = 0.005 
        PREAUTH_FEE = 0.0113  
        
        txn_counts = np.array([np.sum(year) for year in annual_counts])
        volumes = np.array([np.sum(v) for v in annual_volumes])

        fixed_fees = txn_counts * (CLEARING_FEE + DIGITAL_ENABLEMENT_FEE + PREAUTH_FEE)
        cross_border = volumes * 0.2 * CROSS_BORDER_FEE

        def InHouseCosts(year): return 3_200_000 + 1_340_000 * year
        
        def IaaSCosts(year):
            capex = {"Virtual": 315_000, "Plastic": 365_000}.get(input.cardType, 415_000)
            additional_costs = len(input.features) * 1000
            return capex + (480_000 + additional_costs) * year

        years = np.arange(1, len(cardholders) + 1)
        inhouse_core = np.array([InHouseCosts(y) for y in years])
        iaas_core = np.array([IaaSCosts(y) for y in years])

        inhouse_total = inhouse_core + fixed_fees + cross_border
        iaas_total = iaas_core + fixed_fees + cross_border

        in_net = yearly_income - inhouse_total
        iaas_net = yearly_income - iaas_total

        return {
            "years": years.tolist(),
            "incomes": yearly_income.tolist(),
            "costs": {
                "in_house": inhouse_total.tolist(),
                "iaas": iaas_total.tolist()
            },
            "net": {
                "in_house": in_net.tolist(),
                "iaas": iaas_net.tolist()
            },
            "roi": {
                "in_house": ((in_net / inhouse_total) * 100).tolist(),
                "iaas": ((iaas_net / iaas_total) * 100).tolist()
            }
        }

    @staticmethod
    def _simulate_transactions(cardholders, std_dev=7, target_mean=13, min_value=5, max_value=100):
        all_years_volume = []
        all_years_number_tnx = []
        
        for n_cardholders in cardholders:
            daily_counts = np.random.poisson(lam=0.5, size=n_cardholders)
            annual_counts = daily_counts * 365
            tnx_amounts = np.clip(
                np.random.normal(loc=target_mean, scale=std_dev, size=n_cardholders),
                min_value, max_value
            )
            annual_volume = annual_counts * tnx_amounts
            all_years_volume.append(annual_volume)
            all_years_number_tnx.append(annual_counts)
        
        return all_years_volume, all_years_number_tnx

# ==== API Endpoints ====
@app.post("/calculate-roi/auto")
def calculate_auto_roi(input: AutoROIInput) -> Any:
    return ROI.Automatic_ROI.calculate(input)

@app.post("/calculate-roi/manual")
def calculate_manual_roi(input: ManualROIInput) -> Any:
    return ROI.Manual_ROI.calculate(input)