interface Props {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function SelectBox({id, value, onChange, options }: Props) {
  return (
    <div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="" disabled>
          선택하세요
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
