import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Download } from "lucide-react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onExport: () => void;
}

export function FilterBar({ 
  searchTerm, 
  onSearchChange, 
  dateFilter, 
  onDateFilterChange, 
  onExport 
}: FilterBarProps) {
  return (
    <Card className="p-4 bg-card border-border shadow-dashboard">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors, creators..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-full sm:w-48 bg-background border-border">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next-month">Next Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-fy">This FY</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={onExport}
          variant="outline"
          className="w-full sm:w-auto bg-background border-border hover:bg-muted"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </Card>
  );
}