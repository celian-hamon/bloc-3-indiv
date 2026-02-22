import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Collector App</CardTitle>
          <CardDescription>Frontend successfully deployed on app.celianhamon.fr</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium leading-none">
              Test Input Component
            </label>
            <Input id="search" placeholder="Enter something..." />
          </div>
          <Button className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
