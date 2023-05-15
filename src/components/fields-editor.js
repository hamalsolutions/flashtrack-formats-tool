import { useState } from "react";

export default function FieldsEditor(props) {
    const fields = props.fields;
    const [search, setSearch] = useState("");
    
  
    const searcher = (e) => {
        setSearch(e.target.value);
    };
    
    let fieldValues = {};
    fields.forEach((element) => {
        fieldValues[element.name] = false;
    });

    const [filters, setFilters] = useState(fieldValues);

    const fieldSelected = Object.keys(filters)
        .filter((data) => filters[data])
        .join(", ");
    
    const results = !search
        ? Object.keys(filters)
        : Object.keys(filters).filter((data) =>
            data.toLowerCase().includes(search.toLocaleLowerCase())
        );
    
    const handleCheckboxChange = (e) => {
        const name = e.target.name;
        const value = e.target.checked;
  
        setFilters((filters) => ({
            ...filters,
            [name]: value,
        }));
    };
  
    return (
        <>
            <div className="p-3">
                <label htmlFor="input-group-search" className="sr-only">
                    Search
                </label>
                <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                        <svg
                            className="w-5 h-5 dark:text-gray-400"
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="input-group-search"
                        className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full pl-10 p-2.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-800"
                        placeholder="Search field"
                        onChange={searcher}
                        value={search}
                    />
                </div>
            </div>
            <p className="block text-sm font-medium text-gray-700 px-3 sm:pt-4 pb-5">
                {" "}
                Fields Selected:{" "}
                <span className="text-sm  font-normal text-gray-700">
                    {fieldSelected}
                </span>
            </p>
            <div className="overflow-y-auto h-[625px] px-1">
                {results.map((attribute, index) => (
                    <div key={attribute} className="flex items-center">
                        <input
                            id={`filter-mobile-${attribute}-${index}`}
                            name={attribute}
                            defaultValue={filters[attribute]}
                            type="checkbox"
                            defaultChecked={filters[attribute]}
                            className="h-4 w-4 border-gray-300 rounded text-ft-blue-300 focus:ring-ft-yellow-400"
                            onChange={(e) => {
                                handleCheckboxChange(e);
                            }}
                        />
                        <label
                            htmlFor={`filter-mobile-${attribute}-${index}`}
                            className="ml-3 min-w-0 flex-1 text-gray-500"
                        >
                            {attribute}
                        </label>
                    </div>
                ))}
            </div>
        </>
    );
    
}  