"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";

function getRiskColor(level: string) {
	switch (level) {
		case "high":
			return "bg-red-100 text-red-800 dark:bg-red-500/30 dark:text-red-100";
		case "medium":
			return "bg-amber-100 text-amber-800 dark:bg-amber-500/30 dark:text-amber-100";
		case "low":
			return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-100";
		default:
			return "bg-muted text-foreground";
	}
}

type Suspicious = { id: number; amount: string; merchant: string; date: string; riskLevel: string; reason: string };

export function FraudDetection() {
	const [items, setItems] = useState<Suspicious[]>([]);
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("/api/fraud-detection", { cache: "no-store" });
				const json = await res.json();
				setItems(Array.isArray(json.items) ? json.items : []);
			} catch {
				setItems([]);
			}
		})();
	}, []);
	return (
		<div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
			<div className="mb-5 flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
					<AlertTriangle className="h-5 w-5" />
				</span>
				<div>
					<h3 className="text-lg font-semibold text-foreground">Fraud Detection</h3>
					<p className="text-sm text-muted-foreground">Stay ahead of risky transactions with adaptive scoring.</p>
				</div>
			</div>

			<div className="mb-5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-100/70 via-background to-background px-5 py-4 dark:border-amber-400/40 dark:from-amber-500/25 dark:via-background/60">
				<p className="text-sm font-semibold text-foreground">
					{items.length} Suspicious Transactions Detected
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Our AI has identified potentially fraudulent activity. Review and dispute if necessary.
				</p>
			</div>

			<div className="space-y-4">
				{items.map((transaction) => (
					<div
						key={transaction.id}
						className="flex items-start gap-4 rounded-2xl border border-border/60 bg-muted/40 p-4 transition-surface hover:border-primary/35 hover:bg-muted/60 hover:shadow-[var(--shadow-soft)] dark:bg-muted/20"
					>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full ${getRiskColor(
								transaction.riskLevel
							)}`}
						>
							<Shield className="h-5 w-5" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-foreground">
								{transaction.amount}
							</h3>
							<p className="text-sm text-muted-foreground">{transaction.merchant}</p>
							<div className="text-xs text-muted-foreground/80 mt-1">
								{transaction.date} • {transaction.reason}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
