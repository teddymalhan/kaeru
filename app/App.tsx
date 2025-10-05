"use client"

import { Shield, Bell, Settings, User, Plus } from "lucide-react";
import { Navbar } from "./components/navbar";
import { Stats } from "./components/Stats";
import { AgentStatus } from "./components/AgentStatus";
import { TaskList } from "./components/TaskList";
import { FraudDetection } from "./components/FraudDetection";
import { ActivityFeed } from "./components/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Financial Agent Dashboard</h1>
          <p className="text-sm text-gray-600">Monitor your AI agent's activity, manage tasks, and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <Stats />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-8">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent pb-3 px-0 font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent pb-3 px-0 font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="calls" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent pb-3 px-0 font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Calls
            </TabsTrigger>
            <TabsTrigger 
              value="fraud" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:bg-transparent pb-3 px-0 font-medium text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              Fraud Detection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Left 2/3 */}
              <div className="lg:col-span-2 space-y-6">
                <TaskList />
                <ActivityFeed />
              </div>

              {/* Sidebar - Right 1/3 */}
              <div className="space-y-6">
                <AgentStatus />
                <FraudDetection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TaskList />
              </div>
              <div className="space-y-6">
                <AgentStatus />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* <CallQueue /> */}
                <div className="p-6 bg-white rounded-lg border border-gray-200 text-gray-600">
                  Call queue component not found.
                </div>
              </div>
              <div>
                <AgentStatus />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fraud">
            <FraudDetection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}