import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaRegBell } from "react-icons/fa";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationComponent from "@/components/Notification/NotificationComponent";
import axios from "axios";

// const BASE_URL ="http://192.168.0.167:3000"
const BASE_URL = `https://api.priceobo.com`;

const Notifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [failedJobs, setFailedJobs] = useState([]); 

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/jobs`);
      const jobs = response.data.jobs;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentFailedJobs = jobs.filter((job) => {
        const nextRunAt = job.nextRunAt ? new Date(job.nextRunAt) : null;
        const lastRunAt = job.lastRunAt ? new Date(job.lastRunAt) : null;
        const isFailed = job.failCount || (!lastRunAt && nextRunAt && nextRunAt < new Date());
        const isRecent = (lastRunAt && lastRunAt >= oneWeekAgo) || (nextRunAt && nextRunAt >= oneWeekAgo);
        const isRead = JSON.parse(localStorage.getItem(`notification_${job._id}`)) || false;

        return isFailed && isRecent && !isRead;
      });

      setUnreadCount(recentFailedJobs.length);
      setFailedJobs(recentFailedJobs); 
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleNotificationRead = (jobId) => {
    localStorage.setItem(`notification_${jobId}`, JSON.stringify(true));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <FaRegBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Notifications</h4>
              <NotificationComponent 
                // failedJobs={failedJobs} 
                // onNotificationRead={handleNotificationRead} 
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Notifications;
