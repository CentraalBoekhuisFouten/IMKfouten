import React, { useState, useEffect } from "react";
import { loadFromStorage } from "../utils/storage";

const TotalErrors = () => {
  const [rankedEmployees, setRankedEmployees] = useState([]);

  useEffect(() => {
    const employees = loadFromStorage("employees") || [];
    const dates = loadFromStorage("dates") || [];
    const aggregated = {};

    dates.forEach((date) => {
      const errors = loadFromStorage(`errors_${date}`) || {};
      Object.entries(errors).forEach(([employee, errorData]) => {
        if (!aggregated[employee]) {
          aggregated[employee] = {
            notScanned: 0,
            error2: 0,
            error3: 0,
            total: 0,
          };
        }
        aggregated[employee].notScanned += errorData.notScanned || 0;
        aggregated[employee].error2 += errorData.error2 || 0;
        aggregated[employee].error3 += errorData.error3 || 0;
      });
    });

    Object.keys(aggregated).forEach((employee) => {
      aggregated[employee].total =
        aggregated[employee].notScanned +
        aggregated[employee].error2 +
        aggregated[employee].error3;
    });

    const sorted = employees
      .map((emp) => ({
        name: emp,
        ...aggregated[emp],
      }))
      .sort((a, b) => (b.total || 0) - (a.total || 0));

    let currentPlace = 1;
    let lastTotal = null;
    let placeCounter = 1;
    const result = [];

    sorted.forEach((emp) => {
      const total = emp.total || 0;
      if (total !== lastTotal) {
        currentPlace = placeCounter;
      }
      result.push({
        ...emp,
        place: currentPlace,
      });
      lastTotal = total;
      placeCounter++;
    });

    setRankedEmployees(result);
  }, []);

  const getRowClass = (place) => {
    if (place === 1) return "place-first";
    if (place === 2) return "place-second";
    if (place === 3) return "place-third";
    return "";
  };

  return (
    <div className="total-errors-container">
      <h2>Algemeen foutenrapport</h2>
      <table className="errors-table">
        <thead>
          <tr>
            <th>Positie</th>
            <th>Medewerker</th>
            <th>Niet gescand</th>
            <th>Fout 2</th>
            <th>Fout 3</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          {rankedEmployees.map((emp) => (
            <tr key={emp.name} className={getRowClass(emp.place)}>
              <td>{emp.place}</td>
              <td>{emp.name}</td>
              <td>{emp.notScanned || 0}</td>
              <td>{emp.error2 || 0}</td>
              <td>{emp.error3 || 0}</td>
              <td>{emp.total || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TotalErrors;
