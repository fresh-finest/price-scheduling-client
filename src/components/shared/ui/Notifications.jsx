import { Button } from "@/components/ui/button";
import { FaRegBell } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
const Notifications = () => {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <FaRegBell size={20} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Notifications will be displayed in here!
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Notifications;