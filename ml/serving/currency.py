"""Currency conversion for recommendations."""
from typing import Dict, Optional
from dataclasses import dataclass


@dataclass
class CurrencyRate:
    """Currency exchange rate."""
    
    from_currency: str
    to_currency: str
    rate: float
    timestamp: str


class CurrencyConverter:
    """Convert prices between currencies."""
    
    # USD to INR rates (can be updated/fetched from API)
    DEFAULT_RATES = {
        "USD_to_INR": 83.50,  # Current approximate rate
        "INR_to_USD": 0.01199,
    }
    
    def __init__(self, rates: Optional[Dict[str, float]] = None):
        """
        Initialize converter.
        
        Args:
            rates: Custom exchange rates
        """
        self.rates = rates or self.DEFAULT_RATES.copy()
    
    def usd_to_inr(self, amount_usd: float) -> float:
        """
        Convert USD to INR.
        
        Args:
            amount_usd: Amount in USD
        
        Returns:
            Amount in INR
        """
        rate = self.rates.get("USD_to_INR", 83.50)
        return amount_usd * rate
    
    def inr_to_usd(self, amount_inr: float) -> float:
        """
        Convert INR to USD.
        
        Args:
            amount_inr: Amount in INR
        
        Returns:
            Amount in USD
        """
        rate = self.rates.get("INR_to_USD", 0.01199)
        return amount_inr * rate
    
    def format_inr(self, amount: float) -> str:
        """
        Format amount as INR string.
        
        Args:
            amount: Amount in rupees
        
        Returns:
            Formatted string (e.g., "₹8,350.00")
        """
        return f"₹{amount:,.2f}"
    
    def format_usd(self, amount: float) -> str:
        """
        Format amount as USD string.
        
        Args:
            amount: Amount in dollars
        
        Returns:
            Formatted string (e.g., "$100.00")
        """
        return f"${amount:,.2f}"
    
    def set_rate(self, from_currency: str, to_currency: str, rate: float) -> None:
        """
        Set custom exchange rate.
        
        Args:
            from_currency: Source currency
            to_currency: Target currency
            rate: Exchange rate
        """
        key = f"{from_currency}_to_{to_currency}"
        self.rates[key] = rate


# Global converter instance
_converter = CurrencyConverter()


def convert_usd_to_inr(amount: float) -> float:
    """Convert USD to INR using global converter."""
    return _converter.usd_to_inr(amount)


def format_inr(amount: float) -> str:
    """Format amount as INR using global converter."""
    return _converter.format_inr(amount)