interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
}

export default function KPIWidget({ title, value, icon, delta }: Props) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
      <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
      {delta && (
        <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {delta}
        </div>
      )}
    </div>
  );
}
