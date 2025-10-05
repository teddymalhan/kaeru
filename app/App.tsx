"use client"

import { Shield, Bell, Settings, User, Plus } from "lucide-react";
// import { Header } from "./components/Header";
import { Stats } from "./components/Stats";
import { AgentStatus } from "./components/AgentStatus";
import { TaskList } from "./components/TaskList";
import { FraudDetection } from "./components/FraudDetection";
// import { CallQueue } from "./components/CallQueue";
import { ActivityFeed } from "./components/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo and Agent Status */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-gray-900" />
                <span className="font-semibold text-gray-900">FinAgent AI</span>
                <div className="flex items-center gap-1.5 ml-3 px-2.5 py-1 bg-green-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">Active</span>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex items-center gap-8">
                <a href="#" className="text-sm font-semibold text-gray-900">Dashboard</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">History</a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Reports</a>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                <Plus className="h-4 w-4" />
                New Task
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5 text-gray-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-700" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
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