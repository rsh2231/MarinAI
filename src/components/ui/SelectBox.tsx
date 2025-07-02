interface Props {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

export default function SelectBox({ label, id, value, onChange, options }: Props) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1 font-medium text-gray-200">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
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
