import '../routes/Main.css'
import { FilterButtons } from './FilterButtons';

export function Search({ searchInputs, onInputChange, onSubmit, onWriteClick }) {
  return (
    <div id="Search">
      <h1>경로 검색</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          id="departure"
          placeholder="출발지"
          value={searchInputs.departure}
          onChange={onInputChange}
        />
        <input
          type="text"
          id="arrival"
          placeholder="도착지"
          value={searchInputs.arrival}
          onChange={onInputChange}
        />
        <input
          type="date"
          id="date"
          value={searchInputs.date}
          onChange={onInputChange}
        />
        <button
          type="submit"
          className="butn_search"
        >
          검색
        </button>
        <button className="butn_write" onClick={onWriteClick}>
          작성
        </button>
      </form>
    </div>
  );
}