"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Phone, Clock, CheckCircle2 } from "lucide-react"

export function AgentStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent Status</span>
          <Badge variant="default" className="bg-accent text-accent-foreground">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">On Call</p>
              <p className="text-xs text-muted-foreground">Comcast Customer Service</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">12:34</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold">2.5h</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Netflix subscription cancelled</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Amazon return initiated</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
