import random
from datetime import datetime, timezone

from app.core.cache import cached
from app.models.portfolio import Position
from app.models.roast import RoastEntry, RoastMetric, RoastSummary
from app.services.portfolio_service import PortfolioService


class RoastService:
    def __init__(self):
        self._portfolio_service = PortfolioService()

    @cached("roast", ttl=300)
    async def generate_roast(self) -> RoastSummary:
        positions = await self._portfolio_service.get_positions()
        summary = await self._portfolio_service.get_summary()
        return self._build_roast(positions, summary)

    async def regenerate_roast(self) -> RoastSummary:
        # Bypass cache by calling internal method directly
        positions = await self._portfolio_service.get_positions()
        summary = await self._portfolio_service.get_summary()
        roast = self._build_roast(positions, summary)
        from app.core.cache import cache
        cache.invalidate("roast")
        return roast

    def _build_roast(
        self, positions: list[Position], summary: "PortfolioSummary"
    ) -> RoastSummary:
        # Score: lower = more roastable
        score = self._compute_score(positions, summary)

        metrics = self._build_metrics(positions, summary)
        roasted_positions = self._roast_positions(positions, summary)

        verdicts = {
            range(0, 20): [
                "Diamond Hands in a Dumpster Fire 💎🔥",
                "Certified Meme Stock Collector 🤡",
                "Your portfolio needs an exorcist 👻",
            ],
            range(20, 40): [
                "WallStreetBets Honorary Member 🚀",
                "Risk is your middle name 😬",
                "Are you trading or collecting souvenirs? 🎯",
            ],
            range(40, 60): [
                "Aggressively Average 📊",
                "The Definition of Mid 🔸",
                "Somewhere Between Genius and Reckless 🎢",
            ],
            range(60, 80): [
                "Almost Respectable 📈",
                "Your Portfolio Has a Pulse 💚",
                "Warren Buffett's Distant Cousin 👔",
            ],
            range(80, 101): [
                "Boring But Rich 💰",
                "Is This an ETF? 🥱",
                "Risk Manager's Dream Portfolio 😴",
            ],
        }

        for score_range, verdict_list in verdicts.items():
            if score in score_range:
                verdict = random.choice(verdict_list)
                break
        else:
            verdict = "A True Enigma 🌀"

        intros = {
            range(0, 40): [
                "Let's be honest — your portfolio looks like it was assembled by a cat walking across a keyboard.",
                "I've seen better diversification at a poker table where someone went all-in on a single hand.",
            ],
            range(40, 70): [
                "Not terrible, not great. Your portfolio is the financial equivalent of lukewarm coffee.",
                "You have some good picks and some that make me question your life choices. Let's review.",
            ],
            range(70, 101): [
                "Your portfolio is like a well-organized sock drawer — boring but functional.",
                "You're either very smart or very lucky. Let's give you the benefit of the doubt.",
            ],
        }

        for score_range, intro_list in intros.items():
            if score in score_range:
                intro = random.choice(intro_list)
                break
        else:
            intro = "Let's take a look at your portfolio..."

        return RoastSummary(
            overall_score=score,
            overall_verdict=verdict,
            intro_text=intro,
            metrics=metrics,
            positions_roasted=roasted_positions,
            generated_at=datetime.now(timezone.utc),
        )

    def _compute_score(
        self, positions: list[Position], summary: "PortfolioSummary"
    ) -> int:
        if not positions:
            return 0

        score = 50  # base
        score += min(summary.diversification_score // 5, 20)  # up to +20 for diversification
        score += min(len(positions), 10) * 2  # up to +20 for having multiple positions
        score -= max(0, int(summary.top_holding_concentration - 30) // 3)  # penalty for concentration
        score += int(summary.total_pl_ratio / 2)  # performance bonus/penalty
        score += int(summary.total_day_change / (summary.total_market_value or 1) * 100) // 5

        return max(0, min(100, score))

    def _build_metrics(
        self, positions: list[Position], summary: "PortfolioSummary"
    ) -> list[RoastMetric]:
        metrics = []

        # Diversification
        div_score = summary.diversification_score
        if div_score >= 70:
            div_verdict = "Safe and boring"
            div_comment = "Your diversification is solid. Almost too solid. Are you sure you're not an algorithm?"
        elif div_score >= 40:
            div_verdict = "Acceptable"
            div_comment = "You spread your risk around. Not exactly exciting, but neither is getting margin called."
        else:
            div_verdict = "dangerous"
            div_comment = f"You own {summary.top_holding_concentration:.0f}% in your top holding. Are you running a hedge fund or a casino?"
        metrics.append(
            RoastMetric(
                label="Diversification",
                value=f"{div_score}/100",
                verdict=div_verdict,
                commentary=div_comment,
            )
        )

        # Performance
        pl_pct = summary.total_pl_ratio
        if pl_pct > 20:
            perf_verdict = "showing off"
            perf_comment = f"Up {pl_pct:.1f}%? Okay, Warren. We get it. Don't let it go to your head."
        elif pl_pct > 0:
            perf_verdict = "green but modest"
            perf_comment = f"You're up {pl_pct:.1f}%. That's better than a savings account. Barely."
        elif pl_pct > -20:
            perf_verdict = "concerning"
            perf_comment = f"Down {abs(pl_pct):.1f}%. The market giveth and the market taketh away. Mostly taketh."
        else:
            perf_verdict = "brutal"
            perf_comment = f"Down {abs(pl_pct):.1f}%! Have you considered a career in philanthropy?"
        metrics.append(
            RoastMetric(
                label="Performance",
                value=f"{pl_pct:+.1f}%",
                verdict=perf_verdict,
                commentary=perf_comment,
            )
        )

        # Position count
        count = len(positions)
        if count >= 15:
            count_verdict = "collector"
            count_comment = f"{count} positions? You're not investing, you're collecting. Do you have a loyalty card?"
        elif count >= 5:
            count_verdict = "reasonable"
            count_comment = f"{count} positions. Enough to diversify, not enough to forget what you own."
        elif count > 1:
            count_verdict = "concentrated"
            count_comment = f"Just {count} positions. You're either very confident or very reckless."
        else:
            count_verdict = "lonely"
            count_comment = "One position? That's not a portfolio. That's a hope and a prayer."
        metrics.append(
            RoastMetric(
                label="Holdings Count",
                value=str(count),
                verdict=count_verdict,
                commentary=count_comment,
            )
        )

        return metrics

    def _roast_positions(
        self, positions: list[Position], summary: "PortfolioSummary"
    ) -> list[RoastEntry]:
        entries = []
        total_val = summary.total_market_value or 1

        templates_bad = [
            "Down {pl_ratio:.1f}%. At this point it's not an investment, it's a donation to {stock_name}'s shareholders.",
            "This position is bleeding so much red it should be in a horror movie. {stock_name}: The Reckoning.",
            "{stock_name} is down {pl_ratio:.1f}%. Have you tried turning it off and on again?",
        ]
        templates_good = [
            "Up {pl_ratio:.1f}%! {stock_name} is carrying your portfolio harder than Atlas carried the sky.",
            "The only thing greener than {stock_name}'s {pl_ratio:.1f}% gain is the envy of your friends.",
            "{stock_name} is up {pl_ratio:.1f}%. Whatever you're doing, don't touch it. Seriously.",
        ]
        templates_big = [
            "{stock_name} is {weight:.0f}% of your portfolio. If it sneezes, your net worth catches a cold.",
            "With {weight:.0f}% in {stock_name}, you're one earnings miss away from a personality change.",
        ]
        templates_small = [
            "Your {stock_name} position is tiny. Are you testing the waters or just window shopping?",
        ]

        for p in sorted(positions, key=lambda x: x.market_val, reverse=True):
            weight = p.market_val / total_val * 100

            if p.pl_ratio < -10:
                comment = random.choice(templates_bad).format(
                    stock_name=p.stock_name, pl_ratio=abs(p.pl_ratio)
                )
            elif p.pl_ratio > 10:
                comment = random.choice(templates_good).format(
                    stock_name=p.stock_name, pl_ratio=p.pl_ratio
                )
            elif weight > 30:
                comment = random.choice(templates_big).format(
                    stock_name=p.stock_name, weight=weight
                )
            else:
                comment = random.choice(templates_small).format(
                    stock_name=p.stock_name
                )

            entries.append(
                RoastEntry(
                    code=p.code,
                    stock_name=p.stock_name,
                    position_weight_pct=weight,
                    pl_ratio=p.pl_ratio,
                    roast_comment=comment,
                )
            )

        return entries
