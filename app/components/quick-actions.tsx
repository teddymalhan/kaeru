"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Phone, XCircle, AlertTriangle, RotateCcw } from "lucide-react"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
          <Phone className="h-5 w-5" />
          <span className="text-sm">Make Call</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
          <XCircle className="h-5 w-5" />
          <span className="text-sm">Cancel Service</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">File Dispute</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 bg-transparent">
          <RotateCcw className="h-5 w-5" />
          <span className="text-sm">Request Return</span>
        </Button>
      </CardContent>
    </Card>
  )
}
