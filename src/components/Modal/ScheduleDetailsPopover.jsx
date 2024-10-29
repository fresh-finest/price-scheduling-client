import React, { useEffect, useState } from "react";

import axios from "axios";
import moment from "moment";
import "./ScheduleDetailsModal.css";
import { Card } from "../ui/card";
import { FaArrowRightLong } from "react-icons/fa6";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dateNames = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "29th",
  "30th",
  "31st",
];

const ScheduleDetailsPopover = ({
  show,
  onClose,
  sku,
  selectedDate,
  eventType,
}) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("eventType:" + eventType);
  useEffect(() => {
    if (sku && show) {
      fetchScheduleDetails();
    }
  }, [sku, show]);

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/schedule/${sku}`);
      const data = response.data.result;

      // Filter the data according to event type and selected date
      const filteredData = filterDataByEventTypeAndDate(data);

      setScheduleData(filteredData);
      setLoading(false);
    } catch (error) {
      setError("Error fetching schedule details");
      setLoading(false);
    }
  };

  const filterDataByEventTypeAndDate = (data) => {
    // Assuming data is an array, and we select the first match
    const schedule = data[0];

    if (!schedule) return null;

    const filteredSchedule = { ...schedule }; // Clone the schedule data

    if (eventType === "monthly") {
      // Filter monthlyTimeSlots based on the selected date
      const dayOfMonth = moment(selectedDate).date(); // Get day of the month (1-31)
      filteredSchedule.monthlyTimeSlots = {
        [dayOfMonth]: schedule.monthlyTimeSlots[dayOfMonth] || [],
      };
    }

    if (eventType === "weekly") {
      // Filter weeklyTimeSlots based on the selected date
      const dayOfWeek = moment(selectedDate).day(); // Get day of week (0-6)
      filteredSchedule.weeklyTimeSlots = {
        [dayOfWeek]: schedule.weeklyTimeSlots[dayOfWeek] || [],
      };
    }

    return filteredSchedule;
  };

  const getDayLabelFromNumber = (dayNumber) => {
    return dayNames[dayNumber] || "";
  };
  const getDateLabelFromNumber = (dateNumber) => {
    return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const schedule = scheduleData; // After filtering

  console.log("schedule", schedule);

  return (
    <Popover show={show} onHide={onClose}>
      {/* <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger> */}
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ScheduleDetailsPopover;