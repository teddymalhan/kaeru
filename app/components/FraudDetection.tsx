import { AlertTriangle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const suspiciousTransactions = [
	{
		id: 1,
		amount: "$1,299.99",
		merchant: "Electronics Depot Online",
		date: "Oct 4, 2025",
		riskLevel: "high",
		reason: "Unusual spending pattern",
	},
	{
		id: 2,
		amount: "$89.99",
		merchant: "Gaming Store",
		date: "Oct 3, 2025",
		riskLevel: "medium",
		reason: "New merchant",
	},
	{
		id: 3,
		amount: "$45.50",
		merchant: "Coffee Express",
		date: "Oct 2, 2025",
		riskLevel: "low",
		reason: "Location anomaly",
	},
];

function getRiskColor(level: string) {
	switch (level) {
		case "high":
			return "bg-red-100 text-red-800";
		case "medium":
			return "bg-yellow-100 text-yellow-800";
		case "low":
			return "bg-green-100 text-green-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
}

export function FraudDetection() {
	return (
		<div className="bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-lg p-6 shadow-md">
			<div className="flex items-center gap-2 mb-5">
				<AlertTriangle className="h-6 w-6 text-gray-900" />
				<h3 className="text-lg font-bold text-gray-900">Fraud Detection</h3>
			</div>

			<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-5">
				<p className="text-sm font-bold text-gray-900 mb-1.5">
					3 Suspicious Transactions Detected
				</p>
				<p className="text-xs text-gray-600">
					Our AI has identified potentially fraudulent activity. Review and dispute
					if necessary.
				</p>
			</div>

			<div className="space-y-4">
				{suspiciousTransactions.map((transaction) => (
					<div
						key={transaction.id}
						className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
					>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full ${getRiskColor(
								transaction.riskLevel
							)}`}
						>
							<Shield className="h-5 w-5" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-gray-800">
								{transaction.amount}
							</h3>
							<p className="text-sm text-gray-600">{transaction.merchant}</p>
							<div className="text-xs text-gray-500 mt-1">
								{transaction.date} • {transaction.reason}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}