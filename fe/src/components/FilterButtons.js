export function FilterButtons({ onFilterChange }) {
  const filters = ["전체", "택시", "운전자", "탑승자"];
  const filtersClass = ["butn_all", "butn_taxi", "butn_driver", "butn_passenger"];

  return (
    <div id="FilterButtons">
      {filters.map((filter, index) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={filtersClass[index]}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}