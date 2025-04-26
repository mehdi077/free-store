"use client";

import OrderTable from "@/components/admin/OrderTable";
import KPIWidget from "@/components/admin/KPIWidget";
import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FiCalendar, FiShoppingBag } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type PeriodKey = "today" | "yesterday" | "week" | "month" | "custom";

function getPeriodRange(period: PeriodKey, customDateRange?: { startDate: Date | null; endDate: Date | null }) {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);
  
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      break;
    case "week":
      // assuming week starts Monday
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 (Sun) -> 6
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case "custom":
      if (customDateRange?.startDate) {
        start = new Date(customDateRange.startDate);
        start.setHours(0, 0, 0, 0);
      }
      if (customDateRange?.endDate) {
        end = new Date(customDateRange.endDate);
        end.setHours(23, 59, 59, 999);
      }
      break;
  }
  return { start: start.getTime(), end: end.getTime() };
}

export default function OrdersPage() {
  const [period, setPeriod] = useState<PeriodKey>("today");
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const { start, end } = useMemo(
    () => getPeriodRange(period, period === "custom" ? dateRange : undefined),
    [period, dateRange]
  );

  const orders = useQuery(api.orders.getOrders, { start, end });

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date range for display
  const formattedDateRange = useMemo(() => {
    if (period !== "custom" || !dateRange.startDate) return "";
    
    const start = format(dateRange.startDate, "d MMM yyyy", { locale: fr });
    const end = dateRange.endDate 
      ? format(dateRange.endDate, "d MMM yyyy", { locale: fr }) 
      : format(new Date(), "d MMM yyyy", { locale: fr });
      
    return `${start} - ${end}`;
  }, [period, dateRange]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange({ startDate: start, endDate: end });
    
    if (start && end) {
      setPeriod("custom");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commandes</h1>

      {/* KPI Widget for orders count in selected time period */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIWidget 
          title={period === "custom" ? "Commandes dans la période" : 
                period === "today" ? "Commandes aujourd'hui" :
                period === "yesterday" ? "Commandes hier" :
                period === "week" ? "Commandes cette semaine" :
                "Commandes ce mois"}
          value={orders?.length || 0} 
          icon={<FiShoppingBag size={20} />}
        />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 flex-wrap items-center">
        {(
          [
            { key: "today", label: "Aujourd'hui" },
            { key: "yesterday", label: "Hier" },
            { key: "week", label: "Cette semaine" },
            { key: "month", label: "Ce mois" },
          ] as { key: PeriodKey; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={
              "px-3 py-1 rounded-md text-sm border " +
              (period === key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            {label}
          </button>
        ))}

        {/* Custom Date Range Selector */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={
              "px-3 py-1 rounded-md text-sm border flex items-center gap-1 " +
              (period === "custom"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
          >
            <FiCalendar size={14} />
            {period === "custom" && formattedDateRange ? formattedDateRange : "Période personnalisée"}
          </button>
          
          {showDatePicker && (
            <div className="absolute z-10 mt-2 bg-white shadow-lg rounded-lg p-4 border">
              <DatePicker
                selected={dateRange.startDate}
                onChange={handleDateChange}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                selectsRange
                inline
                locale={fr}
                monthsShown={2}
                calendarClassName="custom-calendar"
              />
            </div>
          )}
        </div>
      </div>

      {/* Display filtered period */}
      <div className="text-sm text-gray-500">
        {period === "custom" && formattedDateRange 
          ? `Affichage des commandes pour la période: ${formattedDateRange}`
          : ""
        }
      </div>

      {orders ? (
        <OrderTable orders={orders} />
      ) : (
        <div>Chargement...</div>
      )}
    </div>
  );
}
