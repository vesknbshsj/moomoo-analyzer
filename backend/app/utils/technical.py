from typing import Optional

import pandas as pd


def compute_indicators(df: pd.DataFrame) -> dict:
    """Compute technical indicators from OHLCV DataFrame.

    Args:
        df: DataFrame with columns: time_key, open, high, low, close, volume

    Returns:
        dict with indicator arrays (list of float or None).
    """
    close = df["close"]

    def _null_list(series) -> list:
        return [None if pd.isna(v) else float(v) for v in series.values]

    ma_5 = _null_list(close.rolling(5).mean())
    ma_20 = _null_list(close.rolling(20).mean())
    ma_60 = _null_list(close.rolling(60).mean())
    ma_200 = _null_list(close.rolling(200).mean())

    # MACD
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    macd_signal = macd_line.ewm(span=9, adjust=False).mean()
    macd_histogram = macd_line - macd_signal

    # RSI 14
    rsi = _compute_rsi(close, 14)

    # Bollinger Bands (20, 2)
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    bb_upper = bb_mid + 2 * bb_std
    bb_lower = bb_mid - 2 * bb_std

    return {
        "ma_5": ma_5,
        "ma_20": ma_20,
        "ma_60": ma_60,
        "ma_200": ma_200,
        "macd_line": _null_list(macd_line),
        "macd_signal": _null_list(macd_signal),
        "macd_histogram": _null_list(macd_histogram),
        "rsi_14": _null_list(rsi),
        "bollinger_upper": _null_list(bb_upper),
        "bollinger_mid": _null_list(bb_mid),
        "bollinger_lower": _null_list(bb_lower),
    }


def _compute_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def detect_support_resistance(
    df: pd.DataFrame, window: int = 20, price_tolerance: float = 0.01
) -> dict:
    """Detect support and resistance levels from price data."""
    close = df["close"].values
    dates = df["time_key"].astype(str).values if "time_key" in df.columns else []

    supports = _find_levels(close, window, find_min=True)
    resistances = _find_levels(close, window, find_min=False)

    # Cluster nearby levels
    supports = _cluster_levels(supports, price_tolerance)
    resistances = _cluster_levels(resistances, price_tolerance)

    return {
        "supports": [
            {"level": level, "strength": count}
            for level, count in sorted(supports, key=lambda x: x[0], reverse=True)[:3]
        ],
        "resistances": [
            {"level": level, "strength": count}
            for level, count in sorted(resistances, key=lambda x: x[0])[:3]
        ],
    }


def _find_levels(
    prices: list[float], window: int, find_min: bool
) -> list[float]:
    """Find local minima or maxima using a rolling window."""
    levels = []
    for i in range(window, len(prices) - window):
        window_slice = prices[i - window : i + window + 1]
        if find_min:
            if prices[i] == min(window_slice):
                levels.append(float(prices[i]))
        else:
            if prices[i] == max(window_slice):
                levels.append(float(prices[i]))
    return levels


def _cluster_levels(
    levels: list[float], tolerance: float
) -> list[tuple[float, int]]:
    """Cluster nearby price levels and count occurrences."""
    if not levels:
        return []
    sorted_levels = sorted(set(levels))
    clusters = []
    current_cluster = [sorted_levels[0]]

    for level in sorted_levels[1:]:
        if (level - current_cluster[-1]) / current_cluster[-1] <= tolerance:
            current_cluster.append(level)
        else:
            avg = sum(current_cluster) / len(current_cluster)
            clusters.append((round(avg, 2), len(current_cluster)))
            current_cluster = [level]
    if current_cluster:
        avg = sum(current_cluster) / len(current_cluster)
        clusters.append((round(avg, 2), len(current_cluster)))

    return clusters
